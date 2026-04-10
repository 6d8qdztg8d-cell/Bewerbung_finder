import type { StorageProvider } from "./storage.interface";
import { LocalStorageProvider } from "./local.storage";

function createStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? "local";

  switch (provider) {
    case "local":
      return new LocalStorageProvider();
    // case "s3":
    //   return new S3StorageProvider();
    default:
      throw new Error(`Unknown storage provider: ${provider}`);
  }
}

export const storage = createStorageProvider();
export type { StorageProvider } from "./storage.interface";
