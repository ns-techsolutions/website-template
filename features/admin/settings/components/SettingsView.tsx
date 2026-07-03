"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { PageHeader } from "@/components/admin/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PhoneInput } from "@/components/common/PhoneInput"
import { COUNTRIES, flagEmoji } from "@/lib/phone/countries"
import { initials } from "@/lib/admin/format"
import { useAdminAuthStore } from "@/features/admin/auth/store/admin-auth.store"
import {
  useAdminChangePassword,
  useAdminUpdateProfile,
} from "@/features/admin/auth/hooks/mutations"
import {
  accountProfileFormSchema,
  changePasswordFormSchema,
  type AccountProfileFormInput,
  type ChangePasswordFormInput,
} from "@/features/auth/validations/auth.schema"
import { useSalonSettings } from "@/features/admin/salon-settings/hooks/queries"
import { useUpdateSalonSettings } from "@/features/admin/salon-settings/hooks/mutations"
import {
  notificationPrefsFormSchema,
  salonDetailsFormSchema,
  type NotificationPrefsFormInput,
  type SalonDetailsFormInput,
} from "@/features/admin/salon-settings/validations/salon-settings.schema"
import { useIntegrationSettings } from "@/features/admin/integrations/hooks/queries"
import { useUpdateIntegrationSettings } from "@/features/admin/integrations/hooks/mutations"
import {
  updateIntegrationSettingsSchema,
  type UpdateIntegrationSettingsInput,
} from "@/features/admin/integrations/validations/integration-settings.schema"

const NOTIF_FIELDS: { key: keyof NotificationPrefsFormInput; label: string; desc: string }[] = [
  { key: "newBooking", label: "New booking received", desc: "Email the salon when a customer books online." },
  { key: "bookingCancelled", label: "Booking cancelled", desc: "Notify on cancellations and no-shows." },
  { key: "dailySummary", label: "Daily summary", desc: "A morning digest of the day's schedule." },
  { key: "newReview", label: "New review submitted", desc: "Alert when a customer leaves a review." },
  { key: "leaveRequests", label: "Staff leave requests", desc: "Notify when a request needs approval." },
]

const CURRENCIES = [
  { value: "gbp", label: "GBP (£)" },
  { value: "usd", label: "USD ($)" },
  { value: "eur", label: "EUR (€)" },
]
const TIMEZONES = ["Europe/London", "Europe/Paris", "America/New_York"]

export function SettingsView() {
  const user = useAdminAuthStore((s) => s.user)
  // Integrations (email + payment gateways) are platform-managed: only master
  // admins see and manage them. Tenant admins never load this data.
  const isMaster = user?.role === "master"
  const updateProfile = useAdminUpdateProfile()
  const changePassword = useAdminChangePassword()
  const { data: salon } = useSalonSettings()
  const updateSalon = useUpdateSalonSettings()
  const { data: integ } = useIntegrationSettings({ enabled: isMaster })
  const updateIntegrations = useUpdateIntegrationSettings()

  const profileForm = useForm<AccountProfileFormInput>({
    resolver: zodResolver(accountProfileFormSchema),
    defaultValues: { name: "", email: "", phone: "" },
  })
  useEffect(() => {
    if (user) profileForm.reset({ name: user.name, email: user.email, phone: user.phone ?? "" })
  }, [user, profileForm])

  const salonForm = useForm<SalonDetailsFormInput>({
    resolver: zodResolver(salonDetailsFormSchema),
    defaultValues: {
      name: "", tagline: "", contactEmail: "", contactPhone: "", address: "",
      currency: "gbp", timezone: "Europe/London", defaultCountry: "GB",
    },
  })
  const notifForm = useForm<NotificationPrefsFormInput>({
    resolver: zodResolver(notificationPrefsFormSchema),
    defaultValues: {
      newBooking: false, bookingCancelled: false, dailySummary: false,
      newReview: false, leaveRequests: false,
    },
  })
  useEffect(() => {
    if (salon) {
      salonForm.reset({
        name: salon.name, tagline: salon.tagline, contactEmail: salon.contactEmail,
        contactPhone: salon.contactPhone, address: salon.address,
        currency: salon.currency, timezone: salon.timezone,
        defaultCountry: salon.defaultCountry,
      })
      notifForm.reset(salon.notificationPrefs)
    }
  }, [salon, salonForm, notifForm])

  const pwForm = useForm<ChangePasswordFormInput>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })
  const [pwOk, setPwOk] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  const intForm = useForm<UpdateIntegrationSettingsInput>({
    resolver: zodResolver(updateIntegrationSettingsSchema),
    defaultValues: {
      emailEnabled: false, emailFrom: "", emailReplyTo: "", resendApiKey: "",
      paymentProvider: "none", stripePublishableKey: "", stripeSecretKey: "", stripeWebhookSecret: "",
    },
  })
  useEffect(() => {
    if (integ) {
      intForm.reset({
        emailEnabled: integ.emailEnabled,
        emailFrom: integ.emailFrom,
        emailReplyTo: integ.emailReplyTo,
        paymentProvider: integ.paymentProvider,
        stripePublishableKey: integ.stripePublishableKey,
        // Secrets stay blank in the form; placeholders show whether one is stored.
        resendApiKey: "",
        stripeSecretKey: "",
        stripeWebhookSecret: "",
      })
    }
  }, [integ, intForm])
  const paymentProvider = intForm.watch("paymentProvider")

  function onSubmitProfile(values: AccountProfileFormInput) {
    updateProfile.mutate(values)
  }
  function onSubmitSalon(values: SalonDetailsFormInput) {
    updateSalon.mutate(values)
  }
  function onSubmitNotifPrefs(values: NotificationPrefsFormInput) {
    updateSalon.mutate({ notificationPrefs: values })
  }
  function onSubmitIntegrations(values: UpdateIntegrationSettingsInput) {
    updateIntegrations.mutate(values)
  }
  async function onSubmitPassword(values: ChangePasswordFormInput) {
    setPwError(null)
    setPwOk(false)
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      pwForm.reset({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setPwOk(true)
    } catch (e) {
      setPwError(e instanceof Error ? e.message : "Could not update password.")
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, salon details and preferences."
      />

      <Tabs defaultValue="profile" className="gap-6">
        <TabsList className="w-full max-w-2xl">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="salon">Salon</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {isMaster && <TabsTrigger value="integrations">Integrations</TabsTrigger>}
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
              <Card>
                <CardHeader>
                  <CardTitle>Your profile</CardTitle>
                  <CardDescription>This information is shown to your team.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-16">
                      <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                        {initials(profileForm.watch("name") || user?.name || "")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input value={user?.role ?? ""} disabled className="capitalize" />
                      </FormControl>
                    </FormItem>
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <PhoneInput
                              value={field.value ?? ""}
                              onChange={field.onChange}
                              defaultCountry={salon?.defaultCountry}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end gap-2 border-t border-border pt-6">
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Salon */}
        <TabsContent value="salon">
          <Form {...salonForm}>
            <form onSubmit={salonForm.handleSubmit(onSubmitSalon)}>
              <Card>
                <CardHeader>
                  <CardTitle>Salon details</CardTitle>
                  <CardDescription>
                    Business information shown on the website and receipts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={salonForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Salon name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={salonForm.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Tagline</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={salonForm.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={salonForm.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={salonForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={salonForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CURRENCIES.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={salonForm.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIMEZONES.map((tz) => (
                              <SelectItem key={tz} value={tz}>
                                {tz}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={salonForm.control}
                    name="defaultCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default phone country</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COUNTRIES.map((c) => (
                              <SelectItem key={c.iso2} value={c.iso2}>
                                {flagEmoji(c.iso2)} {c.name} (+{c.dialCode})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Pre-selected country for phone inputs across the storefront.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="justify-end gap-2 border-t border-border pt-6">
                  <Button type="submit" disabled={updateSalon.isPending}>
                    {updateSalon.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Form {...notifForm}>
            <form onSubmit={notifForm.handleSubmit(onSubmitNotifPrefs)}>
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Choose what the salon is notified about.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {NOTIF_FIELDS.map((n) => (
                    <FormField
                      key={n.key}
                      control={notifForm.control}
                      name={n.key}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                            <div>
                              <p className="text-sm font-medium text-foreground">{n.label}</p>
                              <p className="text-sm text-muted-foreground">{n.desc}</p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                disabled={!salon}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
                <CardFooter className="justify-end gap-2 border-t border-border pt-6">
                  <Button type="submit" disabled={updateSalon.isPending || !salon}>
                    {updateSalon.isPending ? "Saving…" : "Save preferences"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Integrations — master only (platform-managed) */}
        {isMaster && (
        <TabsContent value="integrations" className="space-y-4">
          <Form {...intForm}>
            <form onSubmit={intForm.handleSubmit(onSubmitIntegrations)} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email</CardTitle>
                  <CardDescription>
                    Send booking confirmations and password resets from your own address
                    via Resend.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={intForm.control}
                    name="emailEnabled"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between rounded-lg border border-border p-4">
                          <Label className="font-normal">Enable transactional email</Label>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={intForm.control}
                      name="emailFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>e.g. &quot;Salon &lt;hi@salon.com&gt;&quot;</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={intForm.control}
                      name="emailReplyTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reply-to (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={intForm.control}
                      name="resendApiKey"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Resend API key</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={integ?.hasResendKey ? "••••••••" : "re_…"}
                              {...field}
                            />
                          </FormControl>
                          {integ?.hasResendKey && (
                            <FormDescription>A key is saved — type to replace it.</FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payments</CardTitle>
                  <CardDescription>
                    Choose a payment gateway. Only gateways enabled by the platform are
                    available.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={intForm.control}
                    name="paymentProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment gateway</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full sm:w-72">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(integ?.availableGateways ?? [{ provider: "none", label: "Pay at salon (no online payment)" }]).map((g) => (
                              <SelectItem key={g.provider} value={g.provider}>
                                {g.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {paymentProvider === "stripe" && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={intForm.control}
                        name="stripePublishableKey"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Publishable key</FormLabel>
                            <FormControl>
                              <Input placeholder="pk_test_…" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={intForm.control}
                        name="stripeSecretKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secret key</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={integ?.hasStripeSecretKey ? "••••••••" : "sk_test_…"}
                                {...field}
                              />
                            </FormControl>
                            {integ?.hasStripeSecretKey && (
                              <FormDescription>Saved — type to replace.</FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={intForm.control}
                        name="stripeWebhookSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Webhook signing secret</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={integ?.hasStripeWebhookSecret ? "••••••••" : "whsec_…"}
                                {...field}
                              />
                            </FormControl>
                            {integ?.hasStripeWebhookSecret && (
                              <FormDescription>Saved — type to replace.</FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-end gap-2 border-t border-border pt-6">
                  <Button type="submit" disabled={updateIntegrations.isPending}>
                    {updateIntegrations.isPending ? "Saving…" : "Save integrations"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
        )}

        {/* Security */}
        <TabsContent value="security">
          <Form {...pwForm}>
            <form onSubmit={pwForm.handleSubmit(onSubmitPassword)}>
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Update your password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid max-w-md grid-cols-1 gap-4">
                    <FormField
                      control={pwForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pwForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pwForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm new password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {pwError && <p className="text-sm text-destructive">{pwError}</p>}
                    {pwOk && <p className="text-sm text-[#1E7E34]">Password updated.</p>}
                  </div>
                </CardContent>
                <CardFooter className="justify-end gap-2 border-t border-border pt-6">
                  <Button type="submit" disabled={changePassword.isPending}>
                    {changePassword.isPending ? "Updating…" : "Update password"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </>
  )
}
