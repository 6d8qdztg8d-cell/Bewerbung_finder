import { parsePdf } from "./pdf.parser";

const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
]);

export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string | null> {
  if (!SUPPORTED_MIME_TYPES.has(mimeType)) return null;

  if (mimeType === "application/pdf") {
    return parsePdf(buffer);
  }

  if (mimeType === "text/plain") {
    return buffer.toString("utf-8").trim();
  }

  return null;
}
