import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { StorageProvider, UploadedObject } from "./types";

/**
 * Server-only Supabase client built from the service-role key. Never import this
 * into client components — the service key must stay on the server.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET ?? "media";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  if (!client) {
    client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const supabaseStorage: StorageProvider = {
  async upload(path, file, contentType): Promise<UploadedObject> {
    const supabase = getClient();
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, { contentType, upsert: false });
    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  },

  async remove(path): Promise<void> {
    const supabase = getClient();
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  },
};
