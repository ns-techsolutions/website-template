"use client";

import { apiFetch } from "@/lib/api/client";
import type { CmsPage } from "@/lib/admin/types";
import { workspaceHeaders } from "@/features/admin/workspaces/store/active-workspace.store";
import type { CreatePageInput, UpdatePageInput } from "../validations/page.schema";

/** Client-side fetchers for the CMS page endpoints (consumed by the hooks). */
export const pageApi = {
  list: () =>
    apiFetch<CmsPage[]>("/api/cms/pages", {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  get: (id: string) =>
    apiFetch<CmsPage>(`/api/cms/pages/${id}`, {
      method: "GET",
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  create: (body: CreatePageInput) =>
    apiFetch<CmsPage>("/api/cms/pages", {
      method: "POST",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  update: (id: string, body: UpdatePageInput) =>
    apiFetch<CmsPage>(`/api/cms/pages/${id}`, {
      method: "PATCH",
      body,
      auth: "admin",
      headers: workspaceHeaders(),
    }),

  remove: (id: string) =>
    apiFetch<CmsPage>(`/api/cms/pages/${id}`, {
      method: "DELETE",
      auth: "admin",
      headers: workspaceHeaders(),
    }),
};
