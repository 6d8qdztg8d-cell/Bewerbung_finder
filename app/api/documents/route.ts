import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { documentService } from "@/services/documents/document.service";
import type { DocumentType } from "@prisma/client";

const VALID_DOCUMENT_TYPES: DocumentType[] = [
  "CV",
  "COVER_LETTER",
  "CERTIFICATE",
  "PORTFOLIO",
  "OTHER",
];

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await documentService.listByUser(session.user.id);
  return NextResponse.json({ documents });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 422 });
    }

    if (!type || !VALID_DOCUMENT_TYPES.includes(type as DocumentType)) {
      return NextResponse.json({ error: "Invalid document type." }, { status: 422 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const document = await documentService.upload({
      userId: session.user.id,
      type: type as DocumentType,
      fileName: file.name,
      buffer,
      mimeType: file.type,
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
