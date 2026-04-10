// pdf-parse is a CJS module — import via require to avoid ESM resolution issues.
// Next.js excludes it from the bundle at build time via serverExternalPackages.
// eslint-disable-next-line @typescript-eslint/no-require-imports
import pdfParse = require("pdf-parse");

export async function parsePdf(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text.trim();
}
