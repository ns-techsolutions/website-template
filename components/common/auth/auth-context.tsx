"use client";

import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import { useMe } from "@/features/auth/hooks/queries";
import { useLogin, useLogout, useRegister } from "@/features/auth/hooks/mutations";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { refreshScope } from "@/lib/api/client";
import type { UserDto } from "@/features/auth/types/auth.dto";

import { SignInDialog } from "./SignInDialog";
import { SignUpDialog } from "./SignUpDialog";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";
import { ResetPasswordDialog } from "./ResetPasswordDialog";

export type User = UserDto;

export interface SignUpInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  /** Email-verification code, attached after the OTP step. */
  code?: string;
}

interface AuthContextValue {
  user: User | null;
  /** Resolves on success; rejects with a user-facing message on failure. */
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpInput) => Promise<void>;
  signOut: () => void;
  updateUser: (partial: Partial<Omit<User, "id">>) => void;
  openSignIn: () => void;
  openSignUp: () => void;
  openForgotPassword: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Reads `?token=` from the URL and auto-opens the reset-password dialog.
 * Wrapped in its own component so the parent doesn't need `<Suspense>` at
 * the call-site (useSearchParams requires a Suspense boundary).
 */
function ResetTokenWatcher({
  onToken,
}: {
  onToken: (token: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) onToken(token);
  }, [searchParams, onToken]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const updateUserStore = useAuthStore((s) => s.updateUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const login = useLogin();
  const register = useRegister();
  const logout = useLogout();
  const me = useMe();

  const [hydrated, setHydrated] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // The auth store uses skipHydration so server & first client render both
  // start signed-out. Rehydrate from localStorage, then silently renew the
  // (short-lived) access token from the refresh cookie — this restores the
  // session on reload and discards a stale token whose cookie is gone.
  useEffect(() => {
    let active = true;
    void (async () => {
      await useAuthStore.persist.rehydrate();
      await refreshScope("customer");
      if (active) setHydrated(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  // A stored token that the server rejects (expired/invalid) -> sign out.
  useEffect(() => {
    if (me.isError) clearAuth();
  }, [me.isError, clearAuth]);

  // Callback for the token watcher — stable reference via useState setter.
  function handleResetToken(token: string) {
    setResetToken(token);
    setResetOpen(true);
  }

  async function signIn(email: string, password: string) {
    await login.mutateAsync({ email, password });
  }

  async function signUp(data: SignUpInput) {
    await register.mutateAsync(data);
  }

  function openSignIn() {
    setSignUpOpen(false);
    setForgotOpen(false);
    setResetOpen(false);
    setSignInOpen(true);
  }

  function openSignUp() {
    setSignInOpen(false);
    setForgotOpen(false);
    setResetOpen(false);
    setSignUpOpen(true);
  }

  function openForgotPassword() {
    setSignInOpen(false);
    setSignUpOpen(false);
    setResetOpen(false);
    setForgotOpen(true);
  }

  return (
    <AuthContext.Provider
      value={{
        user: hydrated ? user : null,
        signIn,
        signUp,
        signOut: logout,
        updateUser: updateUserStore,
        openSignIn,
        openSignUp,
        openForgotPassword,
      }}
    >
      {children}

      {/* Auto-detect ?token= in URL for password reset */}
      <Suspense fallback={null}>
        <ResetTokenWatcher onToken={handleResetToken} />
      </Suspense>

      <SignInDialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        onSwitchToSignUp={openSignUp}
        onOpenForgotPassword={openForgotPassword}
        signIn={signIn}
      />
      <SignUpDialog
        open={signUpOpen}
        onOpenChange={setSignUpOpen}
        onSwitchToSignIn={openSignIn}
        signUp={signUp}
      />
      <ForgotPasswordDialog
        open={forgotOpen}
        onOpenChange={setForgotOpen}
        onSwitchToSignIn={openSignIn}
      />
      <ResetPasswordDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        token={resetToken}
        onSwitchToSignIn={openSignIn}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

/** Two-letter initials from a name, for avatar fallbacks. */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
