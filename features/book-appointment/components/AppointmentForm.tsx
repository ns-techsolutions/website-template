"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/common/PhoneInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2Icon, ClockIcon } from "lucide-react";
import { useAuth } from "@/components/common/auth/auth-context";
import { formatSlotLabel } from "@/lib/admin/time-slots";
import { useCreateBooking } from "@/features/bookings/hooks/mutations";
import { bookingApi } from "@/features/bookings/services/booking-query.service";
import { useRequestEmailOtp } from "@/features/email-otp/hooks/mutations";
import { OtpStep } from "@/features/email-otp/components/OtpStep";
import {
  useAvailability,
  useCatalogHours,
  useCatalogServices,
  useCatalogStaff,
} from "@/features/catalog/hooks/queries";
import { AvailabilityCalendar } from "@/features/catalog/components/AvailabilityCalendar";
import { catalogKeys } from "@/features/catalog/queries/catalog.keys";
import {
  appointmentFormSchema,
  type AppointmentFormInput,
} from "@/features/book-appointment/validations/appointment-form.schema";

// Shared underline-style field class. `aria-invalid:ring-0` strips the base
// component's error ring (which clashed with the underline look); the base
// `aria-invalid:border-destructive` then turns the lone bottom border red on error.
const FIELD_CLASS =
  "h-10 w-full rounded-none border-0 border-b border-[#767676] bg-transparent px-0 " +
  "text-base shadow-none focus-visible:ring-0 focus-visible:border-black " +
  "aria-invalid:ring-0 aria-invalid:border-destructive";

// Phone variant: same underline treatment, but without `w-full`/`px-0` since the
// class is shared across the country-code button and the number input.
const PHONE_FIELD_CLASS =
  "h-10 rounded-none border-0 border-b border-[#767676] bg-transparent " +
  "text-base shadow-none focus-visible:ring-0 focus-visible:border-black " +
  "aria-invalid:ring-0 aria-invalid:border-destructive";

export function AppointmentForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  // Opt out of the generic success toast: this form shows its own inline
  // confirmation, and a deposit booking redirects to payment before it's confirmed.
  const createBooking = useCreateBooking({ showSuccessToast: false });
  const requestOtp = useRequestEmailOtp();

  const { data: services = [] } = useCatalogServices();
  const { data: staffList = [] } = useCatalogStaff();
  const { data: hoursData } = useCatalogHours();

  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [phase, setPhase] = useState<"details" | "code">("details");
  const [pending, setPending] = useState<AppointmentFormInput | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    reference: string;
    service: string;
    date: string;
    time: string;
  } | null>(null);

  function defaultValues(): AppointmentFormInput {
    const [firstNameDefault, ...rest] = user?.name?.split(" ") ?? [];
    return {
      firstName: firstNameDefault ?? "",
      lastName: rest.join(" "),
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      service: "",
      staff: "",
      date: undefined as unknown as Date,
      time: "",
    };
  }

  const form = useForm<AppointmentFormInput>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: defaultValues(),
  });

  useEffect(() => {
    form.reset(defaultValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const date = form.watch("date");
  const serviceId = form.watch("service");
  const staffId = form.watch("staff");

  const dateKey = date ? format(date, "yyyy-MM-dd") : undefined;
  // Availability is duration-aware (per the chosen service) and per-staff.
  const { data: timeSlots = [] } = useAvailability(
    dateKey,
    serviceId || undefined,
    staffId || undefined,
  );

  // The set of free slots shifts when the service (duration) or staff changes,
  // so drop any previously-picked time to avoid submitting a now-invalid slot.
  useEffect(() => {
    form.setValue("time", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, staffId]);

  function handleDateSelect(next: Date | undefined) {
    form.setValue("date", next as Date);
    form.setValue("time", "");
  }

  // Creates the booking and runs the post-create flow (deposit redirect or inline
  // confirmation). `code` carries the email-verification OTP for guest bookings.
  async function submitBooking(values: AppointmentFormInput, code?: string) {
    const serviceLabel =
      services.find((s) => s.id === values.service)?.name ?? "Appointment";
    const submittedDateKey = format(values.date, "yyyy-MM-dd");

    const record = await createBooking.mutateAsync({
      email: values.email,
      customerName: `${values.firstName} ${values.lastName ?? ""}`.trim(),
      phone: values.phone || undefined,
      serviceId: values.service,
      staffId: values.staff || undefined,
      date: submittedDateKey,
      time: values.time,
      code,
    });

    queryClient.invalidateQueries({ queryKey: catalogKeys.all });

    // If the service requires a deposit, attempt online checkout.
    const selectedService = services.find((s) => s.id === values.service);
    if (selectedService?.requiresDeposit) {
      try {
        setRedirecting(true);
        const { url } = await bookingApi.checkout(record.id);
        if (url) {
          window.location.href = url;
          return;
        }
      } catch {
        // No payment gateway configured — fall through to confirmation.
      } finally {
        setRedirecting(false);
      }
    }

    setConfirmation({
      reference: record.reference,
      service: serviceLabel,
      date: format(values.date, "PPP"),
      time: formatSlotLabel(values.time),
    });
    form.reset(defaultValues());
    setPhase("details");
    setPending(null);
  }

  async function onSubmit(values: AppointmentFormInput) {
    setError(null);
    try {
      // Signed-in users are trusted (their account email is verified). Guests
      // must verify their email first — unless the salon can't deliver email.
      if (user) {
        await submitBooking(values);
        return;
      }
      const { required } = await requestOtp.mutateAsync({
        email: values.email,
        purpose: "booking",
      });
      if (!required) {
        await submitBooking(values);
        return;
      }
      setPending(values);
      setPhase("code");
    } catch (err) {
      // The slot may have just been taken (409) — refresh availability and clear
      // the now-stale time so the customer re-picks from the live list.
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      form.setValue("time", "");
      setError(
        err instanceof Error ? err.message : "Unable to book your appointment.",
      );
    }
  }

  async function handleVerify(code: string) {
    if (!pending) return;
    setCodeError(null);
    setVerifying(true);
    try {
      await submitBooking(pending, code);
    } catch (err) {
      // Keep the live slot list in sync in case the slot was taken mid-verify.
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      setCodeError(
        err instanceof Error ? err.message : "Unable to verify the code.",
      );
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (!pending) return;
    setCodeError(null);
    try {
      await requestOtp.mutateAsync({ email: pending.email, purpose: "booking" });
    } catch (err) {
      setCodeError(
        err instanceof Error ? err.message : "Unable to resend the code.",
      );
    }
  }

  return (
    <section className="reine-container py-14 md:py-18">
      {confirmation && (
        <div className="mx-auto mb-10 w-full max-w-[1100px] rounded-2xl border border-[#cfe6d4] bg-[#f0f9f2] p-5 text-[#1E7E34]">
          <div className="flex items-start gap-3">
            <CheckCircle2Icon className="mt-0.5 size-5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Appointment requested!</p>
              <p className="mt-1 text-[#2f6b3d]">
                Your {confirmation.service} on {confirmation.date} at{" "}
                {confirmation.time} is booked under reference{" "}
                <span className="font-semibold">{confirmation.reference}</span>.{" "}
                {user ? (
                  <Link href="/account" className="font-semibold underline">
                    View it in My Account
                  </Link>
                ) : (
                  "Sign in with this email to track it in My Account."
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {phase === "code" ? (
        <div className="mx-auto w-full max-w-[440px] rounded-2xl border border-[#e3e3e3] p-6 md:p-8">
          <h2 className="mb-4 text-lg font-medium text-[#232323]">
            Verify your email
          </h2>
          <OtpStep
            email={pending?.email ?? ""}
            onSubmit={handleVerify}
            onResend={handleResend}
            onBack={() => setPhase("details")}
            submitting={verifying}
            error={codeError}
            submitLabel="Confirm booking"
          />
        </div>
      ) : (
        <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto w-full max-w-[1100px]">
          <div className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-1 block text-sm font-normal tracking-[0.02em] text-[#595959]">
                    First Name*
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="First Name"
                      className={FIELD_CLASS}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-1 block text-sm font-normal tracking-[0.02em] text-[#595959]">
                    Last Name*
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Last Name"
                      className={FIELD_CLASS}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-1 block text-sm font-normal tracking-[0.02em] text-[#595959]">
                    Email Address*
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email Address"
                      className={FIELD_CLASS}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="mb-1 block text-sm font-normal tracking-[0.02em] text-[#595959]">
                    Phone Number*
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      defaultCountry={hoursData?.defaultCountry}
                      placeholder="Phone Number"
                      error={!!fieldState.error}
                      className={PHONE_FIELD_CLASS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end">
                  <FormLabel className="mb-1 block text-sm font-normal tracking-[0.02em] text-[#595959] sr-only">
                    Service
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className={`${FIELD_CLASS} text-[#5b5b5b]`}>
                        <SelectValue placeholder="---Please choose a service---" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="staff"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end">
                  <FormLabel className="mb-1 block text-sm font-normal tracking-[0.02em] text-[#595959] sr-only">
                    Staff
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className={`${FIELD_CLASS} text-[#5b5b5b]`}>
                        <SelectValue placeholder="---Any available stylist---" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staffList.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="date"
            render={({ field, fieldState }) => (
              <FormItem
                className={`mt-6 flex flex-col border-b pb-2 ${
                  fieldState.error ? "border-destructive" : "border-[#767676]"
                }`}
              >
                <FormLabel className="mb-1 block text-sm font-normal tracking-[0.02em] text-[#595959]">
                  Date*
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <button type="button" className={`inline-flex items-center w-full justify-start text-left font-normal rounded-none bg-transparent px-0 hover:bg-transparent text-base ${!field.value && "text-[#5b5b5b]"}`}>
                        {field.value ? format(field.value, "PPP") : <span>mm/dd/yyyy</span>}
                        <CalendarIcon className="ml-auto h-4 w-4" />
                      </button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl border border-[#bfe3c6] shadow-lg overflow-hidden" align="start">
                    <AvailabilityCalendar
                      selected={field.value}
                      onSelect={handleDateSelect}
                      openingHours={hoursData?.openingHours}
                      closures={hoursData?.closures}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {date && (
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="mt-6 flex flex-col">
                  <FormLabel className="mb-2 block text-sm font-normal tracking-[0.02em] text-[#595959]">
                    Time*
                  </FormLabel>
                  {timeSlots.length === 0 ? (
                    <p className="text-sm text-[#5b5b5b]">
                      No time slots available on this date. Please choose another day.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => field.onChange(slot)}
                          aria-pressed={field.value === slot}
                          className={`flex h-10 items-center justify-center gap-1.5 rounded-full border text-sm transition-colors ${
                            field.value === slot
                              ? "border-[#3f3f3f] bg-[#2f2f2f] text-white"
                              : "border-[#d9d9d9] text-[#5b5b5b] hover:border-[#3f3f3f]"
                          }`}
                        >
                          <ClockIcon className="size-3.5" />
                          {formatSlotLabel(slot)}
                        </button>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {error && (
            <p className="mt-6 text-center text-sm font-medium text-[#D32F2F]">
              {error}
            </p>
          )}

          <div className="mt-8 text-center">
            <button
              type="submit"
              disabled={createBooking.isPending || redirecting || requestOtp.isPending}
              className="inline-flex h-[46px] items-center justify-center rounded-full border border-[#3f3f3f] px-9 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#232323] transition-all hover:-translate-y-px hover:bg-[#2f2f2f] hover:text-white disabled:opacity-60"
            >
              {redirecting
                ? "Redirecting to payment…"
                : requestOtp.isPending
                  ? "Sending code…"
                  : createBooking.isPending
                    ? "Booking…"
                    : "Book Appointment"}
            </button>
          </div>
        </form>
        </Form>
      )}

      {/* Big availability calendar — hidden, kept for reference */}
      {/*
      <section
        className="mx-auto mt-9 w-full max-w-2xl lg:max-w-4xl flex justify-center"
        aria-label="Appointment calendar"
      >
        <div className="flex flex-col items-center w-full">
          <h2 className="mb-8 text-xl font-medium text-[#8d8d8d]">Select Availability</h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={{ before: today }}
            className="w-full bg-white p-0 border-none rounded-none shadow-none"
            classNames={{
              root: "w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] pb-8 pt-4 md:pt-8 md:px-4",
              months: "flex flex-col w-full relative",
              month: "w-full",
              month_grid: "w-full px-2 md:px-6 flex flex-col mt-4",
              weeks: "flex flex-col",
              weekdays: "grid grid-cols-7 border-b border-[#eaeaea] pb-4 text-center text-[0.75rem] md:text-[0.85rem] font-medium text-[#8d8d8d] uppercase tracking-widest w-full",
              weekday: "text-center font-semibold w-full flex items-center justify-center p-0 m-0",
              week: "grid grid-cols-7 w-full gap-y-1 md:gap-y-2 mt-4",
              day: "h-12 md:h-16 lg:h-20 w-full p-0 flex items-stretch justify-center relative",
              nav: "flex items-center justify-between px-6 text-[#8d8d8d] absolute top-2 md:top-4 left-0 right-0 w-full z-10 pointer-events-none [&_button]:pointer-events-auto",
              button_previous: "h-12 w-12 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors text-[#8d8d8d] hover:text-black relative cursor-pointer outline-none",
              button_next: "h-12 w-12 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors text-[#8d8d8d] hover:text-black relative cursor-pointer outline-none",
              month_caption: "flex justify-center flex-1 pointer-events-none w-full",
              caption_label: "",
            }}
            modifiers={{
              available: isAvailableDay,
            }}
            components={{
              Chevron: ({ orientation }) => {
                if (orientation === "left") {
                  return <svg className="size-6 md:size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
                }
                if (orientation === "right") {
                  return <svg className="size-6 md:size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6 6-6"/></svg>;
                }
                return <svg className="size-6 md:size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
              },
              MonthCaption: ({ calendarMonth }: { calendarMonth: { date: Date } }) => {
                const m =
                  calendarMonth?.date instanceof Date && !isNaN(calendarMonth.date.getTime())
                    ? calendarMonth.date
                    : new Date();
                return (
                  <div className="flex flex-col items-center pointer-events-auto select-none pt-2 pb-6 w-full">
                    <span className="text-[1rem] md:text-[1.2rem] font-medium tracking-[0.1em] text-[#8d8d8d] leading-none mb-2">{format(m, "yyyy")}</span>
                    <span className="text-[1.5rem] md:text-[2rem] font-medium uppercase tracking-[0.05em] text-[#1a1a1a] leading-none">{format(m, "MMMM")}</span>
                  </div>
                );
              },
              DayButton: ({ day, modifiers, ...props }) => {
                const isAvailable = modifiers.available;
                const isSelected = modifiers.selected;
                const isOutside = modifiers.outside;

                return (
                  <button
                    {...props}
                    type="button"
                    className={`h-11 w-11 md:h-14 md:w-14 lg:h-16 lg:w-16 mx-auto min-w-0 p-2 font-normal rounded-xl flex flex-col items-center justify-center transition-all duration-200 outline-none
                      ${isSelected ? 'bg-[#a06f55] text-white shadow-md shadow-[#a06f55]/20' : 'hover:bg-black/5 text-[#4d4d4d]' }
                      ${modifiers.disabled ? 'opacity-30 cursor-not-allowed hidden' : 'cursor-pointer'}
                      ${isOutside ? 'opacity-0 pointer-events-none' : ''}
                    `}
                  >
                    <span className={`leading-none text-[1.1rem] md:text-[1.3rem] font-medium ${isSelected ? 'text-white' : ''}`}>{day.date.getDate()}</span>
                    <div className="h-4 flex items-center justify-center mt-1">
                      {isAvailable && (
                        <span className={`block h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#a06f55]'}`} />
                      )}
                    </div>
                  </button>
                );
              }
            }}
          />
        </div>
      </section>
      */}
    </section>
  );
}
