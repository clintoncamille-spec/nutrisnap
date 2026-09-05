export interface ImageStorage {
  upload(
    userId: string,
    file: Buffer,
    mimeType: string,
    fileName: string,
  ): Promise<{ path: string; signedUrl: string }>;
  getSignedUrl(path: string, expiresInSeconds?: number): Promise<string>;
  isOwnedByUser(userId: string, path: string): boolean;
}
