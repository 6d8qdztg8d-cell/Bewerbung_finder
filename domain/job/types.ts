import type { JobListing, JobMatch, WorkMode, JobType, JobStatus } from "@prisma/client";

export type NormalizedJob = {
  externalId: string;
  provider: string;
  title: string;
  company: string;
  location: string | null;
  workMode: WorkMode | null;
  jobType: JobType | null;
  description: string;
  requirements: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  applyUrl: string;
  status: JobStatus;
  postedAt: Date | null;
  rawData: Record<string, unknown>;
};

export type JobWithMatch = JobListing & {
  matches: JobMatch[];
};

export interface JobProvider {
  readonly name: string;
  search(query: JobSearchQuery): Promise<NormalizedJob[]>;
}

export type JobSearchQuery = {
  titles: string[];
  locations: string[];
  jobTypes?: JobType[];
  workModes?: WorkMode[];
  limit?: number;
};
