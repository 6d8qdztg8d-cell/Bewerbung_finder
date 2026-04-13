// pdf-parse is a CJS-only module excluded from the bundle via serverExternalPackages.
// We use a runtime require() cast to avoid ESM import issues.
/* eslint-disable @typescript-eslint/no-require-imports */
type PdfParseResult = { text: string };
type PdfParseFn = (buffer: Buffer) => Promise<PdfParseResult>;

export async function parsePdf(buffer: Buffer): Promise<string> {
  const pdfParse = (require("pdf-parse") as PdfParseFn);
  const result = await pdfParse(buffer);
  return result.text.trim();
}
