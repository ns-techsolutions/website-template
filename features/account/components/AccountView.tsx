"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDaysIcon, ClockIcon, LogOutIcon, UserIcon } from "lucide-react";
import { format } from "date-fns";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/common/PhoneInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, initials } from "@/components/common/auth/auth-context";
import { formatSlotLabel } from "@/lib/admin/time-slots";
import { useBookings } from "@/features/bookings/hooks/queries";
import {
  useCancelBooking,
  useRescheduleBooking,
} from "@/features/bookings/hooks/mutations";
import { useUpdateProfile } from "@/features/auth/hooks/mutations";
import {
  accountProfileFormSchema,
  type AccountProfileFormInput,
} from "@/features/auth/validations/auth.schema";
import {
  rescheduleBookingFormSchema,
  type RescheduleBookingFormInput,
} from "@/features/bookings/validations/booking.schema";
import { useAvailability, useCatalogHours } from "@/features/catalog/hooks/queries";
import { useMyReviews } from "@/features/reviews/hooks/queries";
import { LeaveReviewForm } from "@/features/reviews/components/LeaveReviewForm";
import { Stars } from "@/components/common/Stars";
import type { BookingView } from "@/features/bookings/types/booking.view";

const STATUS_META: Record<
  string,
  {
    label: string;
    variant: "success" | "warning" | "info" | "destructive" | "secondary";
  }
> = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "info" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  "no-show": { label: "No-show", variant: "secondary" },
};

export function AccountView() {
  const { user, signOut, openSignIn } = useAuth();
  const { data: bookings = [] } = useBookings();
  const { data: salonHours } = useCatalogHours();
  const { data: myReviews = [] } = useMyReviews();
  const cancelCutoffHours = salonHours?.cancellationCutoffHours ?? 24;
  const cancelBooking = useCancelBooking();
  const rescheduleBooking = useRescheduleBooking();
  const updateProfile = useUpdateProfile();
  const router = useRouter();

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileForm = useForm<AccountProfileFormInput>({
    resolver: zodResolver(accountProfileFormSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  // Reschedule dialog state.
  const [rescheduleAppt, setRescheduleAppt] = useState<BookingView | null>(null);
  const rescheduleForm = useForm<RescheduleBookingFormInput>({
    resolver: zodResolver(rescheduleBookingFormSchema),
    defaultValues: { date: "", time: "" },
  });
  const reDate = rescheduleForm.watch("date");
  const { data: reSlots = [] } = useAvailability(reDate || undefined);

  // Keep the form in sync with the signed-in user. Deferred to a microtask so we
  // don't setState synchronously inside the effect (react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!user) return;
    void Promise.resolve().then(() => {
      profileForm.reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
      });
    });
  }, [user, profileForm]);

  if (!user) {
    return (
      <div className="reine-container flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <h2 className="font-serif text-3xl">You&apos;re not signed in</h2>
        <p className="text-black/60">
          Sign in to view and manage your account details.
        </p>
        <div className="mt-2 flex gap-3">
          <Button onClick={openSignIn} className="h-11 px-6">
            Sign in
          </Button>
          <Button asChild variant="outline" className="h-11 px-6">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // `useBookings` already returns only this user's bookings (by id or email).
  const myAppointments = [...bookings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Map a booking to the customer's review of it (if any), so completed
  // bookings show either the submitted review or a "leave a review" form.
  const reviewByBooking = new Map(
    myReviews
      .filter((r) => r.bookingId)
      .map((r) => [r.bookingId as string, r]),
  );

  async function onSubmitProfile(values: AccountProfileFormInput) {
    setError(null);
    try {
      await updateProfile.mutateAsync({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: (values.phone ?? "").trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    }
  }

  function openReschedule(appt: BookingView) {
    setRescheduleAppt(appt);
    rescheduleForm.reset({ date: appt.date.slice(0, 10), time: "" });
  }

  async function onSubmitReschedule(values: RescheduleBookingFormInput) {
    if (!rescheduleAppt) return;
    await rescheduleBooking.mutateAsync({
      id: rescheduleAppt.id,
      date: values.date,
      time: values.time,
    });
    setRescheduleAppt(null);
  }

  function handleLogout() {
    signOut();
    router.push("/");
  }

  return (
    <div className="reine-container max-w-2xl py-20 md:py-28">
      <div className="flex flex-col items-center gap-4 text-center">
        <Avatar className="size-20 border border-black/10">
          <AvatarFallback className="bg-black text-2xl font-semibold text-white">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-serif text-3xl">{user.name}</h2>
          <p className="text-black/60">{user.email}</p>
        </div>
      </div>

      <Form {...profileForm}>
        <form
          onSubmit={profileForm.handleSubmit(onSubmitProfile)}
          className="mt-12 space-y-6 rounded-2xl border border-black/10 bg-white p-6 md:p-8"
        >
          <h3 className="font-serif text-xl">My Information</h3>

          <FormField
            control={profileForm.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input type="text" className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input type="email" className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel>
                  Phone{" "}
                  <span className="font-normal text-black/50">(optional)</span>
                </FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    defaultCountry={salonHours?.defaultCountry}
                    placeholder="7700 900000"
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              className="h-11 px-6 font-semibold"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? "Saving…" : "Save changes"}
            </Button>
            {saved && (
              <span className="text-sm font-medium text-green-600">Saved!</span>
            )}
            {error && (
              <span className="text-sm font-medium text-[#D32F2F]">{error}</span>
            )}
          </div>
        </form>
      </Form>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl">My Appointments</h3>
          <Button asChild variant="outline" className="h-9 px-4">
            <Link href="/book-appointment">Book new</Link>
          </Button>
        </div>

        {myAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 bg-white p-8 text-center text-black/60">
            <p>You have no appointments yet.</p>
            <Button asChild className="mt-4 h-11 px-6">
              <Link href="/book-appointment">Book an appointment</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {myAppointments.map((appt) => {
              const meta = STATUS_META[appt.status] ?? {
                label: appt.status,
                variant: "secondary" as const,
              };
              const active =
                appt.status === "pending" || appt.status === "confirmed";
              const existingReview = reviewByBooking.get(appt.id);
              return (
                <li
                  key={appt.id}
                  className="rounded-2xl border border-black/10 bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold">
                          {appt.service}
                        </h4>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-black/60">
                        <p className="flex items-center gap-2">
                          <CalendarDaysIcon className="size-4" />
                          {format(new Date(appt.date), "EEEE, PPP")}
                        </p>
                        {appt.time && (
                          <p className="flex items-center gap-2">
                            <ClockIcon className="size-4" />
                            {formatSlotLabel(appt.time)}
                          </p>
                        )}
                        {appt.staff && (
                          <p className="flex items-center gap-2">
                            <UserIcon className="size-4" />
                            {appt.staff}
                          </p>
                        )}
                        <p className="text-xs text-black/40">
                          Ref: {appt.reference}
                        </p>
                      </div>
                    </div>
                    {active && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openReschedule(appt)}
                          className="h-9 px-4"
                        >
                          Reschedule
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => cancelBooking.mutate(appt.id)}
                          disabled={cancelBooking.isPending}
                          className="h-9 px-4 text-[#D32F2F]"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  {active && (
                    <p className="mt-3 text-xs text-black/40">
                      Free cancellation up to {cancelCutoffHours} hours before your
                      appointment; any deposit is refunded automatically. Later
                      cancellations forfeit the deposit.
                    </p>
                  )}
                  {appt.status === "completed" && (
                    <div className="mt-4 border-t border-black/10 pt-4">
                      {existingReview ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Stars rating={existingReview.rating} />
                            {!existingReview.published && (
                              <Badge variant="warning">Pending approval</Badge>
                            )}
                          </div>
                          {existingReview.comment && (
                            <p className="text-sm text-black/60">
                              &ldquo;{existingReview.comment}&rdquo;
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">How was your visit?</p>
                          <LeaveReviewForm bookingId={appt.id} />
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-10 flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          className="h-11 px-6"
        >
          <LogOutIcon className="size-4" />
          Log out
        </Button>
      </div>

      <Dialog
        open={rescheduleAppt !== null}
        onOpenChange={(o) => !o && setRescheduleAppt(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule appointment</DialogTitle>
            <DialogDescription>
              Pick a new date and time for {rescheduleAppt?.service}.
            </DialogDescription>
          </DialogHeader>

          <Form {...rescheduleForm}>
            <form onSubmit={rescheduleForm.handleSubmit(onSubmitReschedule)}>
              <div className="space-y-4">
                <FormField
                  control={rescheduleForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={new Date().toISOString().slice(0, 10)}
                          className="h-11"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            rescheduleForm.setValue("time", "");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={rescheduleForm.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel>Time</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!reDate}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder={reDate ? "Select a time" : "Pick a date first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {formatSlotLabel(slot)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {reDate && reSlots.length === 0 && (
                        <p className="text-sm text-black/50">No times available on this date.</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={rescheduleBooking.isPending}>
                  {rescheduleBooking.isPending ? "Saving…" : "Confirm"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
