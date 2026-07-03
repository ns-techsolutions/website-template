"use client";

import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import { ApiClientError } from "@/lib/api/client";
import { toastService } from "@/lib/toast/toast-service";

type AppMutationOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Query keys to invalidate on success. */
  invalidateKeys?: QueryKey[];
  /** Success toast text. Defaults to "Saved successfully" when omitted. */
  successMessage?: string;
  /** Opt out of the success toast (e.g. flows that navigate away). */
  showSuccessToast?: boolean;
  /** Fallback error toast text when the thrown error carries no message. */
  errorMessage?: string;
  /** Passthrough — runs before the mutation (e.g. reset upload progress). */
  onMutate?: (variables: TVariables) => unknown;
  /** Passthrough — runs after success or error settles. */
  onSettled?: () => void;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: unknown) => void;
};

/**
 * Global mutation wrapper: centralizes cache invalidation and toast feedback so
 * every feature mutation gets consistent UX without repeating boilerplate.
 *
 * Returns the native `useMutation` result unchanged, so `mutate`, `mutateAsync`,
 * `isPending`, etc. keep working at call sites.
 */
export function useAppMutation<TData = unknown, TVariables = void>({
  mutationFn,
  invalidateKeys = [],
  successMessage,
  showSuccessToast = true,
  errorMessage,
  onMutate,
  onSettled,
  onSuccess,
  onError,
}: AppMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate,
    onSettled,
    onSuccess: (data, variables) => {
      invalidateKeys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      if (showSuccessToast) {
        toastService.success(successMessage ?? "Saved successfully");
      }

      onSuccess?.(data, variables);
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError && error.message
          ? error.message
          : errorMessage ?? "Something went wrong";

      toastService.error(message);

      onError?.(error);
    },
  });
}
