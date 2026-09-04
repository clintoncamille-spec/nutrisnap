export interface ImageStorage {
  upload(
    userId: string,
    file: Buffer,
    mimeType: string,
    fileName: string,
  ): Promise<{ path: string; signedUrl: string }>;
  getSignedUrl(path: string, expiresInSeconds?: number): Promise<string>;
}
