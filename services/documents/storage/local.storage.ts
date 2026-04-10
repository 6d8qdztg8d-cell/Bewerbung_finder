import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { StorageProvider, UploadedFile } from "./storage.interface";

const UPLOAD_DIR = process.env.STORAGE_LOCAL_PATH ?? "./uploads";
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export class LocalStorageProvider implements StorageProvider {
  private async ensureDir(dir: string): Promise<void> {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }

  async upload(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<UploadedFile> {
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = path.join(UPLOAD_DIR, `${timestamp}-${safeName}`);

    await this.ensureDir(UPLOAD_DIR);
    await writeFile(storagePath, buffer);

    return {
      path: storagePath,
      url: this.getUrl(storagePath),
      sizeBytes: buffer.length,
      mimeType,
    };
  }

  async delete(storagePath: string): Promise<void> {
    try {
      await unlink(storagePath);
    } catch {
      // File may already be gone — not a hard error
    }
  }

  getUrl(storagePath: string): string {
    const relative = storagePath.replace(UPLOAD_DIR, "").replace(/^\//, "");
    return `${BASE_URL}/uploads/${relative}`;
  }
}
