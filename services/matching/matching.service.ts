import { db } from "@/lib/db";
import { aiService } from "@/services/ai/ai.service";
import { documentService } from "@/services/documents/document.service";
import type { JobMatch } from "@prisma/client";

type MatchWithJob = JobMatch & {
  jobListing: { title: string; company: string; description: string; requirements: string[] };
};

class MatchingService {
  /**
   * Analyze all PENDING matches for a user.
   * Uses the user's active CV against each job's description.
   */
  async analyzeUserMatches(userId: string): Promise<number> {
    const cv = await documentService.getActiveCV(userId);
    if (!cv?.parsedText) {
      throw new Error("No active CV with parsed text found. Upload your CV first.");
    }

    const pending = await db.jobMatch.findMany({
      where: { userId, status: "PENDING" },
      include: {
        jobListing: {
          select: {
            title: true,
            company: true,
            description: true,
            requirements: true,
          },
        },
      },
    });

    let analyzed = 0;

    for (const match of pending) {
      try {
        const result = await aiService.scoreMatch(
          cv.parsedText,
          match.jobListing.description,
          match.jobListing.requirements
        );

        await db.jobMatch.update({
          where: { id: match.id },
          data: {
            score: result.score,
            aiReasoning: `${result.reasoning}\n\nStärken: ${result.strengths.join(", ")}\nLücken: ${result.gaps.join(", ")}`,
            status: "ANALYZED",
            analyzedAt: new Date(),
          },
        });

        analyzed++;
      } catch (err) {
        console.error(`[MatchingService] Failed to analyze match ${match.id}:`, err);
      }
    }

    return analyzed;
  }

  /**
   * Create job matches for a user from newly fetched job listings.
   * Skips jobs the user has already seen (existing match record).
   */
  async createMatchesForUser(userId: string, jobListingIds: string[]): Promise<number> {
    const existing = await db.jobMatch.findMany({
      where: { userId, jobListingId: { in: jobListingIds } },
      select: { jobListingId: true },
    });

    const existingIds = new Set(existing.map((m) => m.jobListingId));
    const newIds = jobListingIds.filter((id) => !existingIds.has(id));

    if (newIds.length === 0) return 0;

    await db.jobMatch.createMany({
      data: newIds.map((jobListingId) => ({
        userId,
        jobListingId,
        score: 0,
        status: "PENDING" as const,
      })),
    });

    return newIds.length;
  }

  async getUserMatches(
    userId: string,
    status?: string,
    page = 1,
    pageSize = 20
  ): Promise<{ matches: MatchWithJob[]; total: number }> {
    const where = {
      userId,
      ...(status ? { status: status as JobMatch["status"] } : {}),
    };

    const [matches, total] = await Promise.all([
      db.jobMatch.findMany({
        where,
        include: {
          jobListing: {
            select: {
              title: true,
              company: true,
              description: true,
              requirements: true,
            },
          },
        },
        orderBy: { score: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.jobMatch.count({ where }),
    ]);

    return { matches: matches as MatchWithJob[], total };
  }

  async updateMatchStatus(
    id: string,
    userId: string,
    status: "APPROVED" | "REJECTED" | "SKIPPED"
  ): Promise<JobMatch> {
    const match = await db.jobMatch.findFirst({ where: { id, userId } });
    if (!match) throw new Error("Match not found.");

    return db.jobMatch.update({ where: { id }, data: { status } });
  }
}

export const matchingService = new MatchingService();
