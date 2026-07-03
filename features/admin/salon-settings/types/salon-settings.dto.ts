// Per-salon business details + notification toggles (stored on SalonSettings;
// `name` lives on Workspace). Surfaced by the admin Settings → Salon/Notifications tabs.

export interface NotificationPrefs {
  newBooking: boolean;
  bookingCancelled: boolean;
  dailySummary: boolean;
  newReview: boolean;
  leaveRequests: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  newBooking: true,
  bookingCancelled: true,
  dailySummary: true,
  newReview: false,
  leaveRequests: true,
};

export interface SalonProfile {
  name: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  timezone: string;
  /** ISO-3166 alpha-2 default country for storefront phone inputs. */
  defaultCountry: string;
  notificationPrefs: NotificationPrefs;
}
