-- AlterTable: add API key fields to UserProfile
ALTER TABLE "UserProfile" ADD COLUMN "openaiApiKey" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN "rapidApiKey" TEXT;
