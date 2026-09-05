import { env } from "../../config/env.js";
import { supabase } from "../../repositories/supabase/client.js";
import type { ImageStorage } from "./types.js";

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

class SupabaseImageStorage implements ImageStorage {
  async upload(
    userId: string,
    file: Buffer,
    mimeType: string,
    fileName: string,
  ): Promise<{ path: string; signedUrl: string }> {
    const path = `${userId}/${Date.now()}-${sanitizeFileName(fileName)}`;
    const { error } = await supabase.storage
      .from(env.STORAGE_BUCKET)
      .upload(path, file, { contentType: mimeType, upsert: false });

    if (error) throw new Error(`Storage upload failed: ${error.message}`);

    const signedUrl = await this.getSignedUrl(path);
    return { path, signedUrl };
  }

  async getSignedUrl(
    path: string,
    expiresInSeconds = SIGNED_URL_TTL_SECONDS,
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(env.STORAGE_BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data) {
      throw new Error(`Failed to create signed URL: ${error?.message}`);
    }
    return data.signedUrl;
  }

  isOwnedByUser(userId: string, path: string): boolean {
    return path.startsWith(`${userId}/`);
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export const imageStorage: ImageStorage = new SupabaseImageStorage();
