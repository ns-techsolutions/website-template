export interface UploadedObject {
  path: string;
  publicUrl: string;
}

/** Common contract every media storage backend (GCS, Supabase, ...) implements. */
export interface StorageProvider {
  upload(
    path: string,
    file: ArrayBuffer | Uint8Array | Blob,
    contentType: string,
  ): Promise<UploadedObject>;
  remove(path: string): Promise<void>;
}
