import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { JobProvider, JobSearchQuery, NormalizedJob } from "@/domain/job/types";
import { MockJobProvider } from "./providers/mock.provider";
import { IndeedProvider } from "./providers/indeed.provider";
import type { JobListing } from "@prisma/client";

class JobService {
  private providers: JobProvider[];

  constructor() {
    this.providers =
      process.env.NODE_ENV === "production"
        ? [new IndeedProvider()]
        : [new MockJobProvider()];
  }

  /**
   * Run all providers, normalize results, upsert into DB (deduplication via unique index).
   */
  async fetchAndStore(query: JobSearchQuery): Promise<JobListing[]> {
    const allJobs: NormalizedJob[] = [];

    await Promise.allSettled(
      this.providers.map(async (provider) => {
        try {
          const jobs = await provider.search(query);
          allJobs.push(...jobs);
        } catch (err) {
          console.error(`[JobService] Provider ${provider.name} failed:`, err);
        }
      })
    );

    const stored: JobListing[] = [];

    for (const job of allJobs) {
      const listing = await db.jobListing.upsert({
        where: {
          externalId_provider: {
            externalId: job.externalId,
            provider: job.provider,
          },
        },
        create: {
          externalId: job.externalId,
          provider: job.provider,
          title: job.title,
          company: job.company,
          location: job.location,
          workMode: job.workMode,
          jobType: job.jobType,
          description: job.description,
          requirements: job.requirements,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          currency: job.currency,
          applyUrl: job.applyUrl,
          status: job.status,
          postedAt: job.postedAt,
          rawData: job.rawData as Prisma.InputJsonValue,
        },
        update: {
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          status: job.status,
          updatedAt: new Date(),
        },
      });

      stored.push(listing);
    }

    return stored;
  }

  async listOpen(page = 1, pageSize = 20): Promise<{ jobs: JobListing[]; total: number }> {
    const [jobs, total] = await Promise.all([
      db.jobListing.findMany({
        where: { status: "OPEN" },
        orderBy: { fetchedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.jobListing.count({ where: { status: "OPEN" } }),
    ]);

    return { jobs, total };
  }

  async getById(id: string): Promise<JobListing | null> {
    return db.jobListing.findUnique({ where: { id } });
  }
}

export const jobService = new JobService();
