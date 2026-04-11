-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "DocumentType" AS ENUM ('CV', 'COVER_LETTER', 'CERTIFICATE', 'PORTFOLIO', 'OTHER');
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP');
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED', 'UNKNOWN');
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'ANALYZED', 'APPROVED', 'REJECTED', 'SKIPPED');
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'READY', 'SUBMITTED', 'ACKNOWLEDGED', 'REJECTED', 'INTERVIEW', 'OFFER', 'WITHDRAWN');
CREATE TYPE "ApplicationMethod" AS ENUM ('EMAIL', 'PORTAL', 'MANUAL');
CREATE TYPE "LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR');

CREATE TABLE "User" ("id" TEXT NOT NULL, "email" TEXT NOT NULL, "name" TEXT, "image" TEXT, "passwordHash" TEXT, "role" "UserRole" NOT NULL DEFAULT 'USER', "emailVerified" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");

CREATE TABLE "Account" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "type" TEXT NOT NULL, "provider" TEXT NOT NULL, "providerAccountId" TEXT NOT NULL, "refresh_token" TEXT, "access_token" TEXT, "expires_at" INTEGER, "token_type" TEXT, "scope" TEXT, "id_token" TEXT, "session_state" TEXT, CONSTRAINT "Account_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

CREATE TABLE "Session" ("id" TEXT NOT NULL, "sessionToken" TEXT NOT NULL, "userId" TEXT NOT NULL, "expires" TIMESTAMP(3) NOT NULL, CONSTRAINT "Session_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

CREATE TABLE "VerificationToken" ("identifier" TEXT NOT NULL, "token" TEXT NOT NULL, "expires" TIMESTAMP(3) NOT NULL);
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

CREATE TABLE "UserProfile" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL, "phone" TEXT, "location" TEXT, "linkedinUrl" TEXT, "githubUrl" TEXT, "portfolioUrl" TEXT, "summary" TEXT, "skills" TEXT[] DEFAULT ARRAY[]::TEXT[], "languages" TEXT[] DEFAULT ARRAY[]::TEXT[], "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

CREATE TABLE "UserPreference" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "jobTitles" TEXT[] DEFAULT ARRAY[]::TEXT[], "industries" TEXT[] DEFAULT ARRAY[]::TEXT[], "locations" TEXT[] DEFAULT ARRAY[]::TEXT[], "minSalary" INTEGER, "maxSalary" INTEGER, "currency" TEXT NOT NULL DEFAULT 'EUR', "jobTypes" "JobType"[] DEFAULT ARRAY[]::"JobType"[], "workModes" "WorkMode"[] DEFAULT ARRAY[]::"WorkMode"[], "minMatchScore" INTEGER NOT NULL DEFAULT 70, "maxApplicationsPerDay" INTEGER NOT NULL DEFAULT 5, "autoApply" BOOLEAN NOT NULL DEFAULT false, "blacklistedCompanies" TEXT[] DEFAULT ARRAY[]::TEXT[], "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

CREATE TABLE "AvailabilityWindow" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "dayOfWeek" INTEGER NOT NULL, "startHour" INTEGER NOT NULL, "endHour" INTEGER NOT NULL, "timezone" TEXT NOT NULL DEFAULT 'Europe/Berlin', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AvailabilityWindow_pkey" PRIMARY KEY ("id"));
CREATE INDEX "AvailabilityWindow_userId_idx" ON "AvailabilityWindow"("userId");

CREATE TABLE "Document" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "type" "DocumentType" NOT NULL, "name" TEXT NOT NULL, "storagePath" TEXT NOT NULL, "mimeType" TEXT NOT NULL, "sizeBytes" INTEGER NOT NULL, "parsedText" TEXT, "metadata" JSONB, "isActive" BOOLEAN NOT NULL DEFAULT true, "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Document_pkey" PRIMARY KEY ("id"));
CREATE INDEX "Document_userId_type_idx" ON "Document"("userId", "type");

CREATE TABLE "JobListing" ("id" TEXT NOT NULL, "externalId" TEXT NOT NULL, "provider" TEXT NOT NULL, "title" TEXT NOT NULL, "company" TEXT NOT NULL, "location" TEXT, "workMode" "WorkMode", "jobType" "JobType", "description" TEXT NOT NULL, "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[], "salaryMin" INTEGER, "salaryMax" INTEGER, "currency" TEXT, "applyUrl" TEXT NOT NULL, "status" "JobStatus" NOT NULL DEFAULT 'OPEN', "postedAt" TIMESTAMP(3), "expiresAt" TIMESTAMP(3), "rawData" JSONB, "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "JobListing_externalId_provider_key" ON "JobListing"("externalId", "provider");
CREATE INDEX "JobListing_provider_idx" ON "JobListing"("provider");
CREATE INDEX "JobListing_status_idx" ON "JobListing"("status");
CREATE INDEX "JobListing_company_idx" ON "JobListing"("company");

CREATE TABLE "JobMatch" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "jobListingId" TEXT NOT NULL, "score" INTEGER NOT NULL DEFAULT 0, "aiReasoning" TEXT, "status" "MatchStatus" NOT NULL DEFAULT 'PENDING', "analyzedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "JobMatch_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "JobMatch_userId_jobListingId_key" ON "JobMatch"("userId", "jobListingId");
CREATE INDEX "JobMatch_userId_status_idx" ON "JobMatch"("userId", "status");
CREATE INDEX "JobMatch_score_idx" ON "JobMatch"("score");

CREATE TABLE "Application" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "jobMatchId" TEXT NOT NULL, "documentId" TEXT, "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT', "method" "ApplicationMethod" NOT NULL DEFAULT 'PORTAL', "coverLetter" TEXT, "customAnswers" JSONB, "submittedAt" TIMESTAMP(3), "responseAt" TIMESTAMP(3), "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Application_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Application_jobMatchId_key" ON "Application"("jobMatchId");
CREATE INDEX "Application_userId_status_idx" ON "Application"("userId", "status");
CREATE INDEX "Application_submittedAt_idx" ON "Application"("submittedAt");

CREATE TABLE "ApplicationLog" ("id" TEXT NOT NULL, "applicationId" TEXT NOT NULL, "level" "LogLevel" NOT NULL DEFAULT 'INFO', "event" TEXT NOT NULL, "message" TEXT NOT NULL, "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ApplicationLog_pkey" PRIMARY KEY ("id"));
CREATE INDEX "ApplicationLog_applicationId_idx" ON "ApplicationLog"("applicationId");
CREATE INDEX "ApplicationLog_createdAt_idx" ON "ApplicationLog"("createdAt");

ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AvailabilityWindow" ADD CONSTRAINT "AvailabilityWindow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobMatchId_fkey" FOREIGN KEY ("jobMatchId") REFERENCES "JobMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ApplicationLog" ADD CONSTRAINT "ApplicationLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
