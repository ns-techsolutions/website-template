"use client";

import { apiFetch } from "@/lib/api/client";
import type { MediaAsset } from "@/lib/admin/types";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";

/** Reads the natural dimensions of an image file before upload. */
function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) return resolve({ width: 0, height: 0 });
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export const mediaApi = {
  list: () =>
    apiFetch<MediaAsset[]>("/api/cms/media", {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  upload: async (file: File, onProgress?: (percent: number) => void) => {
    const { width, height } = await readImageSize(file);
    const form = new FormData();
    form.append("file", file);
    form.append("width", String(width));
    form.append("height", String(height));
    return apiFetch<MediaAsset>("/api/cms/media", {
      method: "POST",
      body: form,
      auth: "admin",
      isFormData: true,
      headers: workspaceHeaders(),
      onUploadProgress: onProgress,
    });
  },

  remove: (id: string) =>
    apiFetch<MediaAsset>(`/api/cms/media/${id}`, {
      method: "DELETE",
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
