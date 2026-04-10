export interface UploadedFile {
  path: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
}

export interface StorageProvider {
  upload(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadedFile>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}
