"use client";

import { createAuthStore } from "./create-auth-store";

/**
 * Customer (public site) auth store. Distinct from the admin store
 * (`reine.auth.admin`) so a staff session and a customer session can coexist
 * without bleeding into each other.
 */
export const useAuthStore = createAuthStore("reine.auth.customer");
