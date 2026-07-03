import {
  Building2Icon,
  CalendarDaysIcon,
  CalendarOffIcon,
  CircleUserIcon,
  ClockIcon,
  CreditCardIcon,
  FileTextIcon,
  ImageIcon,
  LayoutDashboardIcon,
  ListIcon,
  PaletteIcon,
  ScissorsIcon,
  Settings2Icon,
  ShieldIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react"

export type NavIcon = React.ComponentType<{ className?: string }>

export interface NavItem {
  label: string
  href: string
  icon: NavIcon
  /** Only show this item to master (platform) admins. */
  masterOnly?: boolean
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboardIcon },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Appointments", href: "/admin/appointments", icon: CalendarDaysIcon },
      { label: "Services", href: "/admin/services", icon: ScissorsIcon },
      { label: "Service Categories", href: "/admin/service-categories", icon: TagIcon },
      { label: "Opening Hours", href: "/admin/opening-hours", icon: ClockIcon },
    ],
  },
  {
    title: "Team",
    items: [
      { label: "Staff", href: "/admin/staff", icon: UsersIcon },
      { label: "Roles & Permissions", href: "/admin/roles", icon: ShieldIcon },
      { label: "Leave Management", href: "/admin/leave", icon: CalendarOffIcon },
    ],
  },
  {
    title: "Customers",
    items: [
      { label: "Customers", href: "/admin/customers", icon: CircleUserIcon },
      { label: "Reviews", href: "/admin/reviews", icon: StarIcon },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Pages", href: "/admin/cms/pages", icon: FileTextIcon },
      { label: "Media Library", href: "/admin/cms/media", icon: ImageIcon },
      { label: "Menus", href: "/admin/cms/menus", icon: ListIcon },
      { label: "Appearance", href: "/admin/cms/appearance", icon: PaletteIcon },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "Workspaces", href: "/admin/workspaces", icon: Building2Icon, masterOnly: true },
      { label: "Payment Gateways", href: "/admin/payment-gateways", icon: CreditCardIcon, masterOnly: true },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings2Icon },
    ],
  },
]

export const navItems: NavItem[] = navSections.flatMap((s) => s.items)
