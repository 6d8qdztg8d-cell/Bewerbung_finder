import type {
  Application,
  ApplicationLog,
  JobMatch,
  JobListing,
  Document,
} from "@prisma/client";

export type ApplicationWithRelations = Application & {
  jobMatch: JobMatch & { jobListing: JobListing };
  document: Document | null;
  logs: ApplicationLog[];
};

export type GeneratedApplication = {
  coverLetter: string;
  customAnswers?: Record<string, string>;
};
