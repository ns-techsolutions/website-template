import { gcsStorage } from "./gcs";
import { supabaseStorage } from "./supabase";
import type { StorageProvider } from "./types";

export type { StorageProvider, UploadedObject } from "./types";

/** Active media storage backend, selected via STORAGE_PROVIDER (default "gcs"). */
const provider: StorageProvider =
  process.env.STORAGE_PROVIDER === "supabase" ? supabaseStorage : gcsStorage;

export const uploadMedia = provider.upload;
export const deleteMedia = provider.remove;
