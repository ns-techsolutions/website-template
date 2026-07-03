import {
  AtSignIcon,
  BookMarkedIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  CircleUserIcon,
  ClockIcon,
  GalleryHorizontalEndIcon,
  ImageIcon,
  ImagesIcon,
  LayoutPanelLeftIcon,
  LayoutTemplateIcon,
  ListIcon,
  LogInIcon,
  MailIcon,
  MapPinIcon,
  MessageSquareQuoteIcon,
  MinusIcon,
  PanelsTopLeftIcon,
  PercentIcon,
  PhoneIcon,
  ScrollTextIcon,
  SquareStackIcon,
  StarIcon,
  TextIcon,
  TrendingUpIcon,
  UserPlusIcon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react"

import type { BlockType } from "@/lib/admin/types"

export type NavIcon = React.ComponentType<{ className?: string }>
export type FieldKind = "text" | "textarea" | "image" | "number" | "color" | "select" | "staffPicker"
export type BlockGroup = "Basic" | "Page sections" | "Account & auth"

export interface BlockField {
  key: string
  label: string
  kind: FieldKind
  options?: string[]
}

export interface RepeaterDef {
  key: string
  itemLabel: string
  fields: BlockField[]
  defaultItem: Record<string, string>
}

export interface ImageListDef {
  key: string
  label: string
}

export interface BlockTypeMeta {
  type: BlockType
  label: string
  description: string
  icon: NavIcon
  group: BlockGroup
  fields: BlockField[]
  repeater?: RepeaterDef
  imageList?: ImageListDef
  defaultData: Record<string, unknown>
}

export const blockTypes: BlockTypeMeta[] = [
  // ---- Basic blocks ---------------------------------------------------------
  {
    type: "hero",
    label: "Hero",
    description: "Full-width banner with title and call to action",
    icon: LayoutTemplateIcon,
    group: "Basic",
    fields: [
      { key: "size", label: "Size", kind: "select", options: ["full", "compact"] },
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "title", label: "Title", kind: "text" },
      { key: "subtitle", label: "Subtitle", kind: "text" },
      { key: "image", label: "Background image", kind: "image" },
      { key: "buttonLabel", label: "Button label", kind: "text" },
      { key: "buttonUrl", label: "Button link", kind: "text" },
    ],
    defaultData: { size: "compact", eyebrow: "", title: "New hero", subtitle: "", image: "", buttonLabel: "", buttonUrl: "" },
  },
  {
    type: "richText",
    label: "Rich text",
    description: "A heading with a paragraph of body copy",
    icon: TextIcon,
    group: "Basic",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "body", label: "Body", kind: "textarea" },
    ],
    defaultData: { heading: "New heading", body: "Body text…" },
  },
  {
    type: "image",
    label: "Image",
    description: "A single image with optional caption",
    icon: ImageIcon,
    group: "Basic",
    fields: [
      { key: "image", label: "Image", kind: "image" },
      { key: "caption", label: "Caption", kind: "text" },
      { key: "align", label: "Alignment", kind: "select", options: ["left", "center", "right"] },
    ],
    defaultData: { image: "", caption: "", align: "center" },
  },
  {
    type: "gallery",
    label: "Gallery",
    description: "A grid of tall rounded images",
    icon: GalleryHorizontalEndIcon,
    group: "Basic",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
    ],
    imageList: { key: "images", label: "Images" },
    defaultData: { eyebrow: "", heading: "Gallery", images: [] },
  },
  {
    type: "cards",
    label: "Feature cards",
    description: "A row of titled cards with icons",
    icon: PanelsTopLeftIcon,
    group: "Basic",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "subheading", label: "Subheading", kind: "textarea" },
    ],
    repeater: {
      key: "items",
      itemLabel: "Card",
      fields: [
        { key: "title", label: "Title", kind: "text" },
        { key: "text", label: "Text", kind: "textarea" },
        { key: "icon", label: "Icon name", kind: "text" },
      ],
      defaultItem: { title: "New card", text: "", icon: "Sparkles" },
    },
    defaultData: { eyebrow: "", heading: "Features", subheading: "", items: [] },
  },
  {
    type: "cta",
    label: "Call to action",
    description: "A centered banner that drives a single action",
    icon: SquareStackIcon,
    group: "Basic",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "body", label: "Body", kind: "textarea" },
      { key: "buttonLabel", label: "Button label", kind: "text" },
      { key: "buttonUrl", label: "Button link", kind: "text" },
      { key: "background", label: "Background colour", kind: "color" },
    ],
    defaultData: { eyebrow: "", heading: "Ready to book?", body: "", buttonLabel: "Book now", buttonUrl: "/book-appointment", background: "#f1efec" },
  },
  {
    type: "testimonials",
    label: "Testimonials",
    description: "Customer quotes in grey cards",
    icon: MessageSquareQuoteIcon,
    group: "Basic",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
    ],
    repeater: {
      key: "items",
      itemLabel: "Testimonial",
      fields: [
        { key: "quote", label: "Quote", kind: "textarea" },
        { key: "author", label: "Author", kind: "text" },
        { key: "meta", label: "Meta", kind: "text" },
      ],
      defaultItem: { quote: "", author: "", meta: "" },
    },
    defaultData: { eyebrow: "TESTIMONIALS", heading: "What clients say", items: [] },
  },
  {
    type: "stats",
    label: "Stats",
    description: "A row of key numbers",
    icon: TrendingUpIcon,
    group: "Basic",
    fields: [{ key: "heading", label: "Heading", kind: "text" }],
    repeater: {
      key: "items",
      itemLabel: "Stat",
      fields: [
        { key: "value", label: "Value", kind: "text" },
        { key: "label", label: "Label", kind: "text" },
      ],
      defaultItem: { value: "0", label: "" },
    },
    defaultData: { heading: "", items: [] },
  },
  {
    type: "form",
    label: "Form",
    description: "An embedded form",
    icon: PanelsTopLeftIcon,
    group: "Basic",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "formType", label: "Form type", kind: "select", options: ["contact", "booking", "newsletter"] },
      { key: "buttonLabel", label: "Button label", kind: "text" },
    ],
    defaultData: { heading: "Get in touch", formType: "contact", buttonLabel: "Submit" },
  },
  {
    type: "spacer",
    label: "Spacer",
    description: "Vertical spacing",
    icon: MinusIcon,
    group: "Basic",
    fields: [{ key: "size", label: "Height (px)", kind: "number" }],
    defaultData: { size: 48 },
  },

  // ---- Page sections (mirror the public Reine designs) ----------------------
  {
    type: "intro",
    label: "Intro split",
    description: "Text beside a 3-image collage (home intro)",
    icon: LayoutPanelLeftIcon,
    group: "Page sections",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "body", label: "Body", kind: "textarea" },
      { key: "buttonLabel", label: "Button label", kind: "text" },
      { key: "buttonUrl", label: "Button link", kind: "text" },
    ],
    imageList: { key: "images", label: "Collage images (first 2 small, 3rd wide)" },
    defaultData: { eyebrow: "MIND, BODY AND SOUL", heading: "New intro", body: "", buttonLabel: "Discover More", buttonUrl: "#", images: [] },
  },
  {
    type: "workingHours",
    label: "Working hours",
    description: "Opening hours card beside a heading — hours pulled from Settings → Opening hours",
    icon: ClockIcon,
    group: "Page sections",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "body", label: "Body", kind: "textarea" },
    ],
    defaultData: { eyebrow: "TIME SCHEDULE", heading: "Working Hours", body: "" },
  },
  {
    type: "priceMenu",
    label: "Price menu",
    description: "Service price list with dotted leaders — services pulled from the Services page",
    icon: ListIcon,
    group: "Page sections",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "buttonLabel", label: "Button label", kind: "text" },
      { key: "buttonUrl", label: "Button link", kind: "text" },
    ],
    defaultData: { eyebrow: "", heading: "Our Service Menu", buttonLabel: "", buttonUrl: "" },
  },
  {
    type: "offer",
    label: "Offer banner",
    description: "Centered discount headline (Get 30% OFF)",
    icon: PercentIcon,
    group: "Page sections",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "subheading", label: "Subheading", kind: "text" },
      { key: "buttonLabel", label: "Button label", kind: "text" },
      { key: "buttonUrl", label: "Button link", kind: "text" },
    ],
    defaultData: { eyebrow: "THIS WEEK ONLY", heading: "Get 30% OFF", subheading: "", buttonLabel: "Book an Appointment", buttonUrl: "/book-appointment" },
  },
  {
    type: "imageText",
    label: "Image + text",
    description: "Checklist text beside a tall portrait",
    icon: ImageIcon,
    group: "Page sections",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "image", label: "Portrait image", kind: "image" },
      { key: "buttonLabel", label: "Button label", kind: "text" },
      { key: "buttonUrl", label: "Button link", kind: "text" },
    ],
    repeater: {
      key: "bullets",
      itemLabel: "Bullet",
      fields: [{ key: "text", label: "Text", kind: "textarea" }],
      defaultItem: { text: "" },
    },
    defaultData: { eyebrow: "", heading: "", image: "", buttonLabel: "", buttonUrl: "#", bullets: [] },
  },
  {
    type: "story",
    label: "Story",
    description: "Paragraphs and stats beside an image (about)",
    icon: BookOpenIcon,
    group: "Page sections",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "body", label: "Body (blank line = new paragraph)", kind: "textarea" },
      { key: "image", label: "Image", kind: "image" },
    ],
    repeater: {
      key: "stats",
      itemLabel: "Stat",
      fields: [
        { key: "value", label: "Value", kind: "text" },
        { key: "label", label: "Label", kind: "text" },
      ],
      defaultItem: { value: "0", label: "" },
    },
    defaultData: { eyebrow: "", heading: "", body: "", image: "", stats: [] },
  },
  {
    type: "locations",
    label: "Locations",
    description: "Branch cards with photo and address",
    icon: MapPinIcon,
    group: "Page sections",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
    ],
    repeater: {
      key: "items",
      itemLabel: "Location",
      fields: [
        { key: "name", label: "Name", kind: "text" },
        { key: "address", label: "Address", kind: "text" },
        { key: "established", label: "Established", kind: "text" },
        { key: "image", label: "Photo", kind: "image" },
      ],
      defaultItem: { name: "New location", address: "", established: "est. 2024", image: "" },
    },
    defaultData: { eyebrow: "OUR LOCATIONS", heading: "Welcome", items: [] },
  },
  {
    type: "newsletter",
    label: "Newsletter",
    description: "Email signup bar",
    icon: MailIcon,
    group: "Page sections",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "subheading", label: "Subheading", kind: "text" },
      { key: "placeholder", label: "Input placeholder", kind: "text" },
      { key: "buttonLabel", label: "Button label", kind: "text" },
    ],
    defaultData: { heading: "Join Our Newsletter", subheading: "", placeholder: "Enter your email here", buttonLabel: "Subscribe" },
  },
  {
    type: "instagram",
    label: "Instagram strip",
    description: "Social feed image row with handle",
    icon: AtSignIcon,
    group: "Page sections",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "handle", label: "Handle", kind: "text" },
    ],
    imageList: { key: "images", label: "Feed images" },
    defaultData: { heading: "Follow:", handle: "@reine_studio", images: [] },
  },
  {
    type: "team",
    label: "Team",
    description: "Team member grid — pick staff from the Staff page and order them (shows all active staff when none are picked)",
    icon: UsersIcon,
    group: "Page sections",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
    ],
    repeater: {
      key: "members",
      itemLabel: "Member",
      fields: [{ key: "staffId", label: "Staff member", kind: "staffPicker" }],
      defaultItem: { staffId: "" },
    },
    defaultData: { eyebrow: "OUR TEAM", heading: "Meet the Artisans", members: [] },
  },
  {
    type: "customerReviews",
    label: "Customer reviews",
    description: "Live published customer reviews with average rating — pulled from approved reviews",
    icon: StarIcon,
    group: "Page sections",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "emptyText", label: "Empty state text", kind: "text" },
    ],
    defaultData: { eyebrow: "REVIEWS", heading: "What our clients say", emptyText: "" },
  },
  {
    type: "contactSplit",
    label: "Contact info + form",
    description: "Contact details beside a message form — address, phone and hours pulled from Salon settings",
    icon: PhoneIcon,
    group: "Page sections",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "formHeading", label: "Form heading", kind: "text" },
      { key: "buttonLabel", label: "Form button label", kind: "text" },
    ],
    defaultData: { eyebrow: "CONTACT INFO", heading: "We'd love to hear from you.", formHeading: "Send us a message", buttonLabel: "Send Message" },
  },
  {
    type: "booking",
    label: "Booking form",
    description: "Appointment form with availability calendar",
    icon: CalendarDaysIcon,
    group: "Page sections",
    fields: [
      { key: "heading", label: "Form heading", kind: "text" },
      { key: "buttonLabel", label: "Button label", kind: "text" },
      { key: "calendarHeading", label: "Calendar heading", kind: "text" },
    ],
    defaultData: { heading: "", buttonLabel: "Book Appointment", calendarHeading: "Select Availability" },
  },
  {
    type: "bookAppointment",
    label: "Book Appointment page",
    description: "Full appointment form with calendar and time slots",
    icon: CalendarDaysIcon,
    group: "Page sections",
    fields: [
      { key: "heroTitle", label: "Hero title", kind: "text" },
      { key: "heroSubtitle", label: "Hero subtitle", kind: "text" },
      { key: "heroImage", label: "Hero background image", kind: "image" },
    ],
    defaultData: {
      heroTitle: "Book an Appointment",
      heroSubtitle: "Please fill out the appointment form below to make appointment",
      heroImage: "/images/reine/gallery/img-08-400x500.jpg",
    },
  },
  {
    type: "bookings",
    label: "My Bookings",
    description: "Customer bookings list with cancel and reschedule",
    icon: BookMarkedIcon,
    group: "Page sections",
    fields: [
      { key: "heroEyebrow", label: "Hero eyebrow", kind: "text" },
      { key: "heroTitle", label: "Hero title", kind: "text" },
      { key: "heroImage", label: "Hero background image", kind: "image" },
    ],
    defaultData: {
      heroEyebrow: "Your profile",
      heroTitle: "My Account",
      heroImage: "https://images.unsplash.com/photo-1516975080661-4682a20bd0d2?q=80&w=2000&auto=format&fit=crop",
    },
  },
  {
    type: "bookingSuccess",
    label: "Booking Success",
    description: "Confirmation message after a successful booking",
    icon: CheckCircle2Icon,
    group: "Page sections",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "message", label: "Message", kind: "textarea" },
    ],
    defaultData: {
      heading: "Payment confirmed!",
      message: "Your deposit has been received and your appointment is now confirmed.",
    },
  },
  {
    type: "bookingCancelled",
    label: "Booking Cancelled",
    description: "Message shown when a deposit payment is cancelled or fails",
    icon: XCircleIcon,
    group: "Page sections",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "message", label: "Message", kind: "textarea" },
    ],
    defaultData: {
      heading: "Payment not completed",
      message:
        "Your payment was cancelled, so your appointment isn't confirmed yet. You can try again from your account.",
    },
  },

  {
    type: "legalDoc",
    label: "Legal document",
    description: "Long-form legal page (privacy policy, terms) with a title, last-updated date and numbered sections",
    icon: ScrollTextIcon,
    group: "Page sections",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "title", label: "Title", kind: "text" },
      { key: "lastUpdated", label: "Last updated", kind: "text" },
      { key: "intro", label: "Intro (blank line = new paragraph)", kind: "textarea" },
    ],
    repeater: {
      key: "sections",
      itemLabel: "Section",
      fields: [
        { key: "heading", label: "Section heading", kind: "text" },
        { key: "body", label: "Section body (blank line = new paragraph)", kind: "textarea" },
      ],
      defaultItem: { heading: "New section", body: "" },
    },
    defaultData: {
      eyebrow: "LEGAL",
      title: "Privacy Policy",
      lastUpdated: "",
      intro: "",
      sections: [
        { heading: "Information we collect", body: "" },
        { heading: "How we use your information", body: "" },
        { heading: "Your rights", body: "" },
        { heading: "Contact us", body: "" },
      ],
    },
  },

  // ---- Account & auth -------------------------------------------------------
  {
    type: "signin",
    label: "Sign in",
    description: "Login form card with optional side image",
    icon: LogInIcon,
    group: "Account & auth",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "subtitle", label: "Subtitle", kind: "text" },
      { key: "buttonLabel", label: "Button label", kind: "text" },
      { key: "forgotText", label: "Forgot password text", kind: "text" },
      { key: "footerText", label: "Footer text", kind: "text" },
      { key: "footerLinkLabel", label: "Footer link label", kind: "text" },
      { key: "footerLinkUrl", label: "Footer link", kind: "text" },
      { key: "image", label: "Side image (optional)", kind: "image" },
    ],
    defaultData: {
      eyebrow: "WELCOME BACK",
      heading: "Sign in to your account",
      subtitle: "Enter your details to access your bookings.",
      buttonLabel: "Sign In",
      forgotText: "Forgot password?",
      footerText: "Don't have an account?",
      footerLinkLabel: "Sign up",
      footerLinkUrl: "/signup",
      image: "",
    },
  },
  {
    type: "signup",
    label: "Sign up",
    description: "Registration form card with optional side image",
    icon: UserPlusIcon,
    group: "Account & auth",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "subtitle", label: "Subtitle", kind: "text" },
      { key: "buttonLabel", label: "Button label", kind: "text" },
      { key: "termsText", label: "Terms text", kind: "text" },
      { key: "footerText", label: "Footer text", kind: "text" },
      { key: "footerLinkLabel", label: "Footer link label", kind: "text" },
      { key: "footerLinkUrl", label: "Footer link", kind: "text" },
      { key: "image", label: "Side image (optional)", kind: "image" },
    ],
    defaultData: {
      eyebrow: "GET STARTED",
      heading: "Create your account",
      subtitle: "Join us to book and manage your appointments.",
      buttonLabel: "Create Account",
      termsText: "By signing up you agree to our Terms & Privacy Policy.",
      footerText: "Already have an account?",
      footerLinkLabel: "Sign in",
      footerLinkUrl: "/signin",
      image: "",
    },
  },
  {
    type: "account",
    label: "My account",
    description: "Logged-in account dashboard with sidebar menu",
    icon: CircleUserIcon,
    group: "Account & auth",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "welcomeText", label: "Welcome text", kind: "text" },
      { key: "userName", label: "Member name", kind: "text" },
      { key: "userEmail", label: "Member email", kind: "text" },
      { key: "avatar", label: "Avatar image", kind: "image" },
      { key: "sectionHeading", label: "Content heading", kind: "text" },
      { key: "buttonLabel", label: "Save button label", kind: "text" },
    ],
    repeater: {
      key: "menu",
      itemLabel: "Menu item",
      fields: [
        { key: "label", label: "Label", kind: "text" },
        { key: "icon", label: "Icon name", kind: "text" },
      ],
      defaultItem: { label: "Profile", icon: "User" },
    },
    defaultData: {
      heading: "My Account",
      welcomeText: "Welcome back, Jane",
      userName: "Jane Doe",
      userEmail: "jane@example.com",
      avatar: "",
      sectionHeading: "Profile details",
      buttonLabel: "Save changes",
      menu: [
        { label: "Profile", icon: "User" },
        { label: "My Appointments", icon: "Calendar" },
        { label: "Favourites", icon: "Heart" },
        { label: "Settings", icon: "Settings" },
        { label: "Log out", icon: "LogOut" },
      ],
    },
  },
]

export const blockMap = new Map<BlockType, BlockTypeMeta>(
  blockTypes.map((b) => [b.type, b])
)

export const blockGroups: BlockGroup[] = ["Basic", "Page sections", "Account & auth"]
