import { db } from "@/lib/db";
import { storage } from "./storage";
import { extractText } from "./parsers/text.extractor";
import type { DocumentType, Document } from "@prisma/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ["application/pdf", "text/plain"];

export type UploadDocumentInput = {
  userId: string;
  type: DocumentType;
  fileName: string;
  buffer: Buffer;
  mimeType: string;
};

export class DocumentService {
  async upload(input: UploadDocumentInput): Promise<Document> {
    const { userId, type, fileName, buffer, mimeType } = input;

    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error("File exceeds maximum allowed size of 10 MB.");
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(`File type not allowed. Allowed: PDF, TXT.`);
    }

    const uploaded = await storage.upload(buffer, fileName, mimeType);
    const parsedText = await extractText(buffer, mimeType);

    return db.document.create({
      data: {
        userId,
        type,
        name: fileName,
        storagePath: uploaded.path,
        mimeType: uploaded.mimeType,
        sizeBytes: uploaded.sizeBytes,
        parsedText,
      },
    });
  }

  async listByUser(userId: string): Promise<Document[]> {
    return db.document.findMany({
      where: { userId, isActive: true },
      orderBy: { uploadedAt: "desc" },
    });
  }

  async getById(id: string, userId: string): Promise<Document | null> {
    return db.document.findFirst({
      where: { id, userId, isActive: true },
    });
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const doc = await this.getById(id, userId);
    if (!doc) throw new Error("Document not found.");

    await db.document.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getActiveCV(userId: string): Promise<Document | null> {
    return db.document.findFirst({
      where: { userId, type: "CV", isActive: true },
      orderBy: { uploadedAt: "desc" },
    });
  }
}

export const documentService = new DocumentService();
