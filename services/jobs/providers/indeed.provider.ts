import type { JobProvider, JobSearchQuery, NormalizedJob } from "@/domain/job/types";

/**
 * IndeedProvider — production implementation.
 *
 * Indeed does not offer a free public API anymore.
 * Options:
 *  1. Use the Indeed Publisher API (requires approval)
 *  2. Use a third-party aggregator (e.g. JSearch via RapidAPI)
 *
 * This implementation uses JSearch (RapidAPI) as a drop-in replacement
 * that covers Indeed, LinkedIn and other major job boards.
 * Set RAPID_API_KEY in your environment.
 */

type JSearchJob = {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city: string | null;
  job_country: string | null;
  job_is_remote: boolean;
  job_employment_type: string | null;
  job_description: string;
  job_required_skills: string[] | null;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_apply_link: string;
  job_posted_at_datetime_utc: string | null;
};

export class IndeedProvider implements JobProvider {
  readonly name = "indeed";

  private readonly apiKey = process.env.RAPID_API_KEY ?? "";
  private readonly baseUrl =
    "https://jsearch.p.rapidapi.com/search";

  async search(query: JobSearchQuery): Promise<NormalizedJob[]> {
    if (!this.apiKey) {
      console.warn("[IndeedProvider] RAPID_API_KEY not set — skipping.");
      return [];
    }

    const searchQuery = [
      query.titles.join(" OR "),
      ...(query.locations ?? []),
    ].join(" in ");

    const params = new URLSearchParams({
      query: searchQuery,
      num_pages: "1",
      page: "1",
    });

    const response = await fetch(`${this.baseUrl}?${params}`, {
      headers: {
        "X-RapidAPI-Key": this.apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });

    if (!response.ok) {
      console.error("[IndeedProvider] API error:", response.status);
      return [];
    }

    const data = await response.json() as { data: JSearchJob[] };
    return data.data.map((job) => this.normalize(job));
  }

  private normalize(job: JSearchJob): NormalizedJob {
    const location = [job.job_city, job.job_country]
      .filter(Boolean)
      .join(", ");

    return {
      externalId: job.job_id,
      provider: this.name,
      title: job.job_title,
      company: job.employer_name,
      location: location || null,
      workMode: job.job_is_remote ? "REMOTE" : "ONSITE",
      jobType: this.mapJobType(job.job_employment_type),
      description: job.job_description,
      requirements: job.job_required_skills ?? [],
      salaryMin: job.job_min_salary,
      salaryMax: job.job_max_salary,
      currency: job.job_salary_currency,
      applyUrl: job.job_apply_link,
      status: "OPEN",
      postedAt: job.job_posted_at_datetime_utc
        ? new Date(job.job_posted_at_datetime_utc)
        : null,
      rawData: job as unknown as Record<string, unknown>,
    };
  }

  private mapJobType(type: string | null) {
    const map: Record<string, NormalizedJob["jobType"]> = {
      FULLTIME: "FULL_TIME",
      PARTTIME: "PART_TIME",
      CONTRACTOR: "CONTRACT",
      INTERN: "INTERNSHIP",
    };
    return type ? (map[type] ?? null) : null;
  }
}
