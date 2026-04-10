import type { JobProvider, JobSearchQuery, NormalizedJob } from "@/domain/job/types";

/**
 * Mock provider for local development / testing.
 * Returns realistic-looking job listings without external API calls.
 */
export class MockJobProvider implements JobProvider {
  readonly name = "mock";

  async search(query: JobSearchQuery): Promise<NormalizedJob[]> {
    const { titles, locations } = query;
    const title = titles[0] ?? "Software Engineer";
    const location = locations[0] ?? "Berlin";

    return [
      {
        externalId: `mock-${Date.now()}-1`,
        provider: this.name,
        title: `Senior ${title}`,
        company: "TechCorp GmbH",
        location,
        workMode: "HYBRID",
        jobType: "FULL_TIME",
        description: `Wir suchen einen erfahrenen ${title} für unser Team in ${location}. Du wirst an skalierbaren Backend-Systemen arbeiten und unser Produkt weiterentwickeln.`,
        requirements: ["TypeScript", "Node.js", "PostgreSQL", "5+ Jahre Erfahrung"],
        salaryMin: 70000,
        salaryMax: 95000,
        currency: "EUR",
        applyUrl: "https://example.com/apply/1",
        status: "OPEN",
        postedAt: new Date(),
        rawData: { source: "mock" },
      },
      {
        externalId: `mock-${Date.now()}-2`,
        provider: this.name,
        title: `${title} (Remote)`,
        company: "StartupX",
        location: "Remote",
        workMode: "REMOTE",
        jobType: "FULL_TIME",
        description: `StartupX sucht einen leidenschaftlichen ${title}, der unser kleines, aber feines Team verstärkt.`,
        requirements: ["React", "TypeScript", "3+ Jahre Erfahrung", "Deutsch C1"],
        salaryMin: 60000,
        salaryMax: 80000,
        currency: "EUR",
        applyUrl: "https://example.com/apply/2",
        status: "OPEN",
        postedAt: new Date(),
        rawData: { source: "mock" },
      },
    ];
  }
}
