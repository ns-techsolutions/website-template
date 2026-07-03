import { Storage } from "@google-cloud/storage";

import type { StorageProvider, UploadedObject } from "./types";

/**
 * Server-only GCS client. On Cloud Run, credentials come from the attached
 * runtime service account (Application Default Credentials) — no key file.
 */
export const MEDIA_BUCKET = process.env.GCS_MEDIA_BUCKET ?? "media";

let storage: Storage | null = null;

function getBucket() {
  if (!storage) storage = new Storage();
  return storage.bucket(MEDIA_BUCKET);
}

async function toBuffer(
  file: ArrayBuffer | Uint8Array | Blob,
): Promise<Buffer> {
  if (file instanceof Blob) return Buffer.from(await file.arrayBuffer());
  if (file instanceof ArrayBuffer) return Buffer.from(file);
  return Buffer.from(file);
}

export const gcsStorage: StorageProvider = {
  async upload(path, file, contentType): Promise<UploadedObject> {
    const buffer = await toBuffer(file);
    const object = getBucket().file(path);
    await object.save(buffer, { contentType, resumable: false });
    return {
      path,
      publicUrl: `https://storage.googleapis.com/${MEDIA_BUCKET}/${path}`,
    };
  },

  async remove(path): Promise<void> {
    await getBucket().file(path).delete({ ignoreNotFound: true });
  },
};
