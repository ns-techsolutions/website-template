// Shared domain types for the admin panel (UI-only — no persistence layer).

import type { SocialPlatform } from "@/lib/social/platforms";

export type Status = "active" | "inactive";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";

export type LeaveStatus = "pending" | "approved" | "rejected";

export type LeaveType = "annual" | "sick" | "unpaid" | "maternity" | "other";

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  serviceCount: number;
  status: Status;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  description: string;
  price: number;
  duration: number; // minutes
  status: Status;
  requiresDeposit?: boolean;
  depositAmount?: number | null; // whole currency units
}

export interface Role {
  id: string;
  name: string;
  description: string;
  staffCount: number;
  permissions: string[];
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  role: string;
  specialties: string[];
  status: Status;
  image: string; // media library URL ("" when none)
  joinedDate: string; // ISO
}

export interface Appointment {
  id: string;
  reference: string;
  customer: string;
  email?: string;
  phone: string;
  service: string;
  serviceId?: string; // catalog link (for editing); name kept as snapshot above
  staff: string;
  staffId?: string;
  date: string; // ISO date
  time: string; // "HH:mm"
  duration: number;
  price: number;
  status: AppointmentStatus;
  paymentStatus?: string; // "pending" | "paid" | "failed" | "refunded" | undefined
}

export interface LeaveRequest {
  id: string;
  staff: string;
  staffId: string;
  type: LeaveType;
  from: string; // ISO date
  to: string; // ISO date
  days: number;
  reason: string;
  appliedOn: string; // ISO date
  status: LeaveStatus;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  totalSpent: number;
  lastVisit: string; // ISO date
  status: Status;
  notes?: string;
}

export interface Review {
  id: string;
  customer: string;
  service: string;
  rating: number; // 1..5
  comment: string;
  date: string; // ISO date
  published: boolean;
}

/** A customer's own review, as returned to the storefront account page. Carries
 *  `bookingId` so the UI can map a review back to the booking it belongs to. */
export interface CustomerReview {
  id: string;
  bookingId: string | null;
  service: string;
  rating: number;
  comment: string;
  date: string;
  published: boolean;
}

export interface OpeningHour {
  day: string;
  open: string; // "HH:mm"
  close: string; // "HH:mm"
  closed: boolean;
}

/** A one-off date the salon is closed (holiday / special closure). */
export interface Closure {
  id: string;
  date: string; // "yyyy-MM-dd"
  reason: string;
}

export interface AppointmentSettings {
  /** Length of each bookable time slot, in minutes. */
  slotDurationMinutes: number;
}

export interface Permission {
  key: string;
  label: string;
  group: string;
}

// ---------------------------------------------------------------------------
// Multi-tenancy (SaaS)
// ---------------------------------------------------------------------------

export type WorkspacePlan = "starter" | "pro" | "enterprise";
export type WorkspaceStatus = "active" | "trial" | "suspended";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  domain: string;
  plan: WorkspacePlan;
  status: WorkspaceStatus;
  owner: string;
  members: number;
  createdAt: string; // ISO date
  accent: string; // brand colour used by the switcher avatar
}

// ---------------------------------------------------------------------------
// CMS — generic block-based content model
// ---------------------------------------------------------------------------

export type ContentStatus = "draft" | "published";

export type BlockType =
  | "hero"
  | "richText"
  | "image"
  | "gallery"
  | "cards"
  | "cta"
  | "testimonials"
  | "stats"
  | "form"
  | "spacer"
  // Section blocks that mirror the public Reine page designs
  | "intro"
  | "workingHours"
  | "priceMenu"
  | "offer"
  | "imageText"
  | "story"
  | "locations"
  | "newsletter"
  | "instagram"
  | "team"
  | "customerReviews"
  | "contactSplit"
  | "booking"
  | "bookAppointment"
  | "bookings"
  | "bookingSuccess"
  | "bookingCancelled"
  | "legalDoc"
  // Account & auth blocks
  | "signin"
  | "signup"
  | "account";

export interface Block {
  id: string;
  type: BlockType;
  visible: boolean;
  // Loosely-typed bag of fields — each block type reads the keys it needs.
  data: Record<string, unknown>;
}

export interface CmsPageSeo {
  title: string;
  description: string;
  ogImage: string;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  updatedAt: string; // ISO date
  blocks: Block[];
  seo: CmsPageSeo;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  sizeKb: number;
  width: number;
  height: number;
  uploadedAt: string; // ISO date
}

export interface MenuLink {
  id: string;
  label: string;
  url: string;
}

/** What a header call-to-action button does when clicked. */
export type NavButtonType = "link" | "signin" | "signup";

export interface NavButton {
  id: string;
  label: string;
  type: NavButtonType;
  /** Destination — only meaningful when `type === "link"`. */
  url: string;
  /** Render a vertical divider immediately before this button (desktop header). */
  dividerBefore: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: MenuLink[];
}

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
}

export interface SiteAppearance {
  brandName: string;
  logoLight: string;
  logoDark: string;
  favicon: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  seoTitleTemplate: string;
  seoDescription: string;
  ogImage: string;
}
