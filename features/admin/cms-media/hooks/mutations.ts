"use client";

import { useState } from "react";

import { useAppMutation } from "@/lib/query/use-app-mutation";
import { mediaKeys } from "../queries/media.keys";
import { mediaApi } from "../services/media-query.service";

export function useUploadMedia() {
  // Byte-level upload progress (0–100) for the current file, or null when idle.
  const [progress, setProgress] = useState<number | null>(null);
  const mutation = useAppMutation({
    mutationFn: (file: File) => mediaApi.upload(file, setProgress),
    invalidateKeys: [mediaKeys.lists()],
    successMessage: "Media uploaded",
    onMutate: () => setProgress(0),
    onSettled: () => setProgress(null),
  });
  return Object.assign(mutation, { progress });
}

export function useDeleteMedia() {
  return useAppMutation({
    mutationFn: (id: string) => mediaApi.remove(id),
    invalidateKeys: [mediaKeys.lists()],
    successMessage: "Media deleted",
  });
}
