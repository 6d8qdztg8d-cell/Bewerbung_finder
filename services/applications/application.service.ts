import { db } from "@/lib/db";
import { aiService } from "@/services/ai/ai.service";
import { documentService } from "@/services/documents/document.service";
import type { Application, ApplicationStatus } from "@prisma/client";
import type { ApplicationWithRelations } from "@/domain/application/types";

class ApplicationService {
  /**
   * Create a DRAFT application for an approved match.
   * Generates a cover letter via AI using the user's active CV.
   */
  async createDraft(userId: string, jobMatchId: string): Promise<Application> {
    // Verify match belongs to user and is approved
    const match = await db.jobMatch.findFirst({
      where: { id: jobMatchId, userId, status: "APPROVED" },
      include: {
        jobListing: true,
        application: true,
      },
    });

    if (!match) throw new Error("Match not found or not approved.");
    if (match.application) throw new Error("Application already exists for this match.");

    const cv = await documentService.getActiveCV(userId);
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    let coverLetter: string | undefined;

    if (cv?.parsedText) {
      try {
        coverLetter = await aiService.generateCoverLetter(
          cv.parsedText,
          match.jobListing.title,
          match.jobListing.company,
          match.jobListing.description,
          user?.name ?? "Bewerber"
        );
      } catch (err) {
        console.error("[ApplicationService] Cover letter generation failed:", err);
      }
    }

    const application = await db.application.create({
      data: {
        userId,
        jobMatchId,
        documentId: cv?.id,
        status: "DRAFT",
        coverLetter,
      },
    });

    await db.applicationLog.create({
      data: {
        applicationId: application.id,
        level: "INFO",
        event: "DRAFT_CREATED",
        message: coverLetter
          ? "Application draft created with AI-generated cover letter."
          : "Application draft created (no CV found for cover letter generation).",
      },
    });

    return application;
  }

  async submit(id: string, userId: string): Promise<Application> {
    const app = await db.application.findFirst({
      where: { id, userId, status: { in: ["DRAFT", "READY"] } },
    });

    if (!app) throw new Error("Application not found or already submitted.");

    const updated = await db.application.update({
      where: { id },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    });

    await db.applicationLog.create({
      data: {
        applicationId: id,
        level: "INFO",
        event: "SUBMITTED",
        message: "Application marked as submitted.",
      },
    });

    return updated;
  }

  async updateStatus(
    id: string,
    userId: string,
    status: ApplicationStatus
  ): Promise<Application> {
    const app = await db.application.findFirst({ where: { id, userId } });
    if (!app) throw new Error("Application not found.");

    const updated = await db.application.update({
      where: { id },
      data: {
        status,
        ...(status === "SUBMITTED" ? { submittedAt: new Date() } : {}),
        ...(["ACKNOWLEDGED", "REJECTED", "INTERVIEW", "OFFER"].includes(status)
          ? { responseAt: new Date() }
          : {}),
      },
    });

    await db.applicationLog.create({
      data: {
        applicationId: id,
        level: "INFO",
        event: "STATUS_CHANGED",
        message: `Status changed to ${status}.`,
        metadata: { previousStatus: app.status, newStatus: status },
      },
    });

    return updated;
  }

  async listByUser(
    userId: string,
    status?: ApplicationStatus,
    page = 1,
    pageSize = 20
  ): Promise<{ applications: ApplicationWithRelations[]; total: number }> {
    const where = {
      userId,
      ...(status ? { status } : {}),
    };

    const [applications, total] = await Promise.all([
      db.application.findMany({
        where,
        include: {
          jobMatch: { include: { jobListing: true } },
          document: true,
          logs: { orderBy: { createdAt: "desc" }, take: 5 },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.application.count({ where }),
    ]);

    return { applications: applications as ApplicationWithRelations[], total };
  }

  async getById(id: string, userId: string): Promise<ApplicationWithRelations | null> {
    return db.application.findFirst({
      where: { id, userId },
      include: {
        jobMatch: { include: { jobListing: true } },
        document: true,
        logs: { orderBy: { createdAt: "asc" } },
      },
    }) as Promise<ApplicationWithRelations | null>;
  }
}

export const applicationService = new ApplicationService();
