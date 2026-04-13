import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const [totalJobs, totalMatches, pendingMatches, analyzedMatches, approvedMatches,
    totalApplications, submittedApplications, interviewApplications, offerApplications, totalDocuments] =
    await Promise.all([
      db.jobListing.count({ where: { status: "OPEN" } }),
      db.jobMatch.count({ where: { userId } }),
      db.jobMatch.count({ where: { userId, status: "PENDING" } }),
      db.jobMatch.count({ where: { userId, status: "ANALYZED" } }),
      db.jobMatch.count({ where: { userId, status: "APPROVED" } }),
      db.application.count({ where: { userId } }),
      db.application.count({ where: { userId, status: "SUBMITTED" } }),
      db.application.count({ where: { userId, status: "INTERVIEW" } }),
      db.application.count({ where: { userId, status: "OFFER" } }),
      db.document.count({ where: { userId, isActive: true } }),
    ]);

  return NextResponse.json({
    jobs: { total: totalJobs },
    matches: { total: totalMatches, pending: pendingMatches, analyzed: analyzedMatches, approved: approvedMatches },
    applications: { total: totalApplications, submitted: submittedApplications, interview: interviewApplications, offer: offerApplications },
    documents: { total: totalDocuments },
  });
}
