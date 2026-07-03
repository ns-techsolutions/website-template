"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
} from "lucide-react"

import { AdminLogo } from "@/components/admin/admin-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ApiClientError } from "@/lib/api/client"
import { useAdminLogin } from "@/features/admin/auth/hooks/mutations"
import { loginSchema, type LoginInput } from "@/features/auth/validations/auth.schema"

const highlights = [
  "Track appointments and revenue in real time",
  "Manage staff, roles and leave from one place",
  "Build your service menu and opening hours",
]

interface LoginViewProps {
  brandName: string
  isPlatform?: boolean
}

export function LoginView({ brandName, isPlatform = false }: LoginViewProps) {
  const router = useRouter()
  const adminLogin = useAdminLogin()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const loading = adminLogin.isPending
  const initial = brandName.charAt(0).toUpperCase()
  const description = isPlatform
    ? "Manage every salon on the platform — tenants, plans and master settings — from one console."
    : `Everything you need to run ${brandName} — bookings, services, staff and insights — in one calm, organised dashboard.`

  async function onSubmit(values: LoginInput) {
    setError(null)
    try {
      await adminLogin.mutateAsync(values)
      router.push("/admin/dashboard")
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Something went wrong. Please try again.",
      )
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(120% 120% at 0% 0%, #3a4a7d 0%, #2d3b64 45%, #232e4f 100%)",
          }}
        />
        <div className="relative z-10 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-white/15 font-heading text-lg font-semibold">
            {initial}
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            {brandName}
          </span>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="font-heading text-4xl leading-tight font-semibold">
            Manage your salon, beautifully.
          </h1>
          <p className="text-base text-white/75">{description}</p>
          <ul className="space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <CheckIcon className="size-3" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <AdminLogo href="/admin/login" brandName={brandName} />
          </div>

          <div className="mb-8 space-y-1.5">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              {isPlatform
                ? "Sign in to the platform console to continue."
                : `Sign in to your ${brandName} admin account to continue.`}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  {error}
                </p>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Email address</FormLabel>
                    <div className="relative">
                      <MailIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="h-11 pl-9"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      {/* Self-service reset is for salon (tenant) admins; platform
                          master accounts are reset out of band. */}
                      {!isPlatform && (
                        <Link
                          href="/admin/forgot-password"
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <LockIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-11 px-9"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="size-4" />
                        ) : (
                          <EyeIcon className="size-4" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-2">
                <Checkbox id="remember" defaultChecked />
                <Label htmlFor="remember" className="font-normal text-muted-foreground">
                  Keep me signed in
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full text-sm font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
