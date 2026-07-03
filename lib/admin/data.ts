import type {
  Appointment,
  AppointmentSettings,
  Customer,
  LeaveRequest,
  OpeningHour,
  Permission,
  Review,
  Role,
  Service,
  ServiceCategory,
  StaffMember,
} from "./types"

// ---------------------------------------------------------------------------
// Static mock data for the Reine salon admin panel. UI-only — these seed the
// tables, cards and forms. No network/persistence involved.
// ---------------------------------------------------------------------------

export const serviceCategories: ServiceCategory[] = [
  { id: "cat-1", name: "Facials", description: "Skin care & facial treatments", serviceCount: 6, status: "active" },
  { id: "cat-2", name: "Hair", description: "Cuts, styling, colouring & treatments", serviceCount: 8, status: "active" },
  { id: "cat-3", name: "Make-Up", description: "Bridal, party & everyday make-up", serviceCount: 4, status: "active" },
  { id: "cat-4", name: "Nails", description: "Manicure, pedicure & nail art", serviceCount: 5, status: "active" },
  { id: "cat-5", name: "Waxing", description: "Full body & facial waxing", serviceCount: 7, status: "active" },
  { id: "cat-6", name: "Massage", description: "Relaxation & therapeutic massage", serviceCount: 3, status: "inactive" },
]

export const services: Service[] = [
  { id: "srv-1", name: "Signature Glow Facial", categoryId: "cat-1", category: "Facials", description: "Deep cleanse, exfoliation and hydration.", price: 85, duration: 60, status: "active" },
  { id: "srv-2", name: "Anti-Ageing Facial", categoryId: "cat-1", category: "Facials", description: "Collagen-boosting treatment for mature skin.", price: 120, duration: 75, status: "active" },
  { id: "srv-3", name: "Express Facial", categoryId: "cat-1", category: "Facials", description: "Quick refresh for busy schedules.", price: 45, duration: 30, status: "active" },
  { id: "srv-4", name: "Cut & Blow Dry", categoryId: "cat-2", category: "Hair", description: "Precision cut with professional finish.", price: 55, duration: 60, status: "active" },
  { id: "srv-5", name: "Full Head Colour", categoryId: "cat-2", category: "Hair", description: "Single process all-over colour.", price: 95, duration: 120, status: "active" },
  { id: "srv-6", name: "Balayage", categoryId: "cat-2", category: "Hair", description: "Hand-painted natural-looking highlights.", price: 160, duration: 180, status: "active" },
  { id: "srv-7", name: "Bridal Make-Up", categoryId: "cat-3", category: "Make-Up", description: "Long-wear bridal look with trial.", price: 180, duration: 90, status: "active" },
  { id: "srv-8", name: "Party Make-Up", categoryId: "cat-3", category: "Make-Up", description: "Glam evening look.", price: 70, duration: 45, status: "active" },
  { id: "srv-9", name: "Gel Manicure", categoryId: "cat-4", category: "Nails", description: "Long-lasting gel polish.", price: 40, duration: 45, status: "active" },
  { id: "srv-10", name: "Luxury Pedicure", categoryId: "cat-4", category: "Nails", description: "Soak, scrub, massage and polish.", price: 55, duration: 60, status: "active" },
  { id: "srv-11", name: "Full Leg Wax", categoryId: "cat-5", category: "Waxing", description: "Smooth, long-lasting results.", price: 38, duration: 40, status: "active" },
  { id: "srv-12", name: "Eyebrow Shaping", categoryId: "cat-5", category: "Waxing", description: "Wax and tidy for defined brows.", price: 18, duration: 20, status: "active" },
  { id: "srv-13", name: "Deep Tissue Massage", categoryId: "cat-6", category: "Massage", description: "Targets deeper muscle layers.", price: 90, duration: 60, status: "inactive" },
]

export const permissionCatalog: Permission[] = [
  { key: "dashboard.view", label: "View dashboard", group: "Dashboard" },
  { key: "appointments.view", label: "View appointments", group: "Appointments" },
  { key: "appointments.manage", label: "Manage appointments", group: "Appointments" },
  { key: "services.view", label: "View services", group: "Services" },
  { key: "services.manage", label: "Manage services & categories", group: "Services" },
  { key: "staff.view", label: "View staff", group: "Staff" },
  { key: "staff.manage", label: "Manage staff", group: "Staff" },
  { key: "roles.manage", label: "Manage roles", group: "Staff" },
  { key: "leave.view", label: "View leave requests", group: "Leave" },
  { key: "leave.approve", label: "Approve / reject leave", group: "Leave" },
  { key: "customers.view", label: "View customers", group: "Customers" },
  { key: "reviews.manage", label: "Manage reviews", group: "Reviews" },
  { key: "settings.manage", label: "Manage settings", group: "Settings" },
]

export const roles: Role[] = [
  {
    id: "role-1",
    name: "Administrator",
    description: "Full access to every part of the system.",
    staffCount: 2,
    permissions: permissionCatalog.map((p) => p.key),
  },
  {
    id: "role-2",
    name: "Manager",
    description: "Runs day-to-day operations and staff.",
    staffCount: 3,
    permissions: [
      "dashboard.view", "appointments.view", "appointments.manage",
      "services.view", "services.manage", "staff.view", "staff.manage",
      "leave.view", "leave.approve", "customers.view", "reviews.manage",
    ],
  },
  {
    id: "role-3",
    name: "Receptionist",
    description: "Handles bookings and customer enquiries.",
    staffCount: 2,
    permissions: ["dashboard.view", "appointments.view", "appointments.manage", "customers.view"],
  },
  {
    id: "role-4",
    name: "Stylist",
    description: "Service provider with limited access.",
    staffCount: 6,
    permissions: ["dashboard.view", "appointments.view", "leave.view"],
  },
]

export const staff: StaffMember[] = [
  { id: "stf-1", name: "Olivia Bennett", email: "olivia@reine.com", phone: "+44 7700 900123", roleId: "role-1", role: "Administrator", specialties: ["Management"], status: "active", image: "", joinedDate: "2021-03-15" },
  { id: "stf-2", name: "Sophia Carter", email: "sophia@reine.com", phone: "+44 7700 900456", roleId: "role-2", role: "Manager", specialties: ["Facials", "Make-Up"], status: "active", image: "", joinedDate: "2021-06-02" },
  { id: "stf-3", name: "Amelia Hughes", email: "amelia@reine.com", phone: "+44 7700 900789", roleId: "role-4", role: "Stylist", specialties: ["Hair", "Colour"], status: "active", image: "", joinedDate: "2022-01-20" },
  { id: "stf-4", name: "Isla Morgan", email: "isla@reine.com", phone: "+44 7700 900234", roleId: "role-4", role: "Stylist", specialties: ["Nails"], status: "active", image: "", joinedDate: "2022-04-11" },
  { id: "stf-5", name: "Grace Turner", email: "grace@reine.com", phone: "+44 7700 900567", roleId: "role-4", role: "Stylist", specialties: ["Waxing", "Facials"], status: "active", image: "", joinedDate: "2022-09-05" },
  { id: "stf-6", name: "Mia Robinson", email: "mia@reine.com", phone: "+44 7700 900890", roleId: "role-3", role: "Receptionist", specialties: ["Front desk"], status: "active", image: "", joinedDate: "2023-02-18" },
  { id: "stf-7", name: "Ella Foster", email: "ella@reine.com", phone: "+44 7700 900345", roleId: "role-4", role: "Stylist", specialties: ["Make-Up"], status: "inactive", image: "", joinedDate: "2023-07-30" },
]

export const appointments: Appointment[] = [
  { id: "apt-1", reference: "#A-1043", customer: "Hannah Price", phone: "+44 7700 911001", service: "Signature Glow Facial", staff: "Sophia Carter", date: "2026-06-11", time: "09:30", duration: 60, price: 85, status: "confirmed" },
  { id: "apt-2", reference: "#A-1044", customer: "Lucy Walsh", phone: "+44 7700 911002", service: "Balayage", staff: "Amelia Hughes", date: "2026-06-11", time: "10:00", duration: 180, price: 160, status: "confirmed" },
  { id: "apt-3", reference: "#A-1045", customer: "Emily Shaw", phone: "+44 7700 911003", service: "Gel Manicure", staff: "Isla Morgan", date: "2026-06-11", time: "11:15", duration: 45, price: 40, status: "pending" },
  { id: "apt-4", reference: "#A-1046", customer: "Charlotte Webb", phone: "+44 7700 911004", service: "Bridal Make-Up", staff: "Ella Foster", date: "2026-06-11", time: "13:00", duration: 90, price: 180, status: "completed" },
  { id: "apt-5", reference: "#A-1047", customer: "Freya Knight", phone: "+44 7700 911005", service: "Full Leg Wax", staff: "Grace Turner", date: "2026-06-12", time: "09:00", duration: 40, price: 38, status: "confirmed" },
  { id: "apt-6", reference: "#A-1048", customer: "Daisy Cole", phone: "+44 7700 911006", service: "Cut & Blow Dry", staff: "Amelia Hughes", date: "2026-06-12", time: "14:30", duration: 60, price: 55, status: "cancelled" },
  { id: "apt-7", reference: "#A-1049", customer: "Poppy Hayes", phone: "+44 7700 911007", service: "Luxury Pedicure", staff: "Isla Morgan", date: "2026-06-12", time: "15:45", duration: 60, price: 55, status: "pending" },
  { id: "apt-8", reference: "#A-1050", customer: "Ruby Marsh", phone: "+44 7700 911008", service: "Anti-Ageing Facial", staff: "Sophia Carter", date: "2026-06-13", time: "10:30", duration: 75, price: 120, status: "no-show" },
  { id: "apt-9", reference: "#A-1051", customer: "Evie Barnes", phone: "+44 7700 911009", service: "Party Make-Up", staff: "Ella Foster", date: "2026-06-13", time: "17:00", duration: 45, price: 70, status: "confirmed" },
  { id: "apt-10", reference: "#A-1052", customer: "Maya Dawson", phone: "+44 7700 911010", service: "Eyebrow Shaping", staff: "Grace Turner", date: "2026-06-13", time: "12:15", duration: 20, price: 18, status: "completed" },
]

export const leaveRequests: LeaveRequest[] = [
  { id: "lv-1", staff: "Amelia Hughes", staffId: "stf-3", type: "annual", from: "2026-06-20", to: "2026-06-27", days: 6, reason: "Family holiday abroad.", appliedOn: "2026-06-01", status: "pending" },
  { id: "lv-2", staff: "Isla Morgan", staffId: "stf-4", type: "sick", from: "2026-06-09", to: "2026-06-10", days: 2, reason: "Flu — doctor's note provided.", appliedOn: "2026-06-09", status: "approved" },
  { id: "lv-3", staff: "Grace Turner", staffId: "stf-5", type: "unpaid", from: "2026-07-01", to: "2026-07-03", days: 3, reason: "Personal matters.", appliedOn: "2026-06-05", status: "pending" },
  { id: "lv-4", staff: "Ella Foster", staffId: "stf-7", type: "maternity", from: "2026-08-01", to: "2026-11-01", days: 65, reason: "Maternity leave.", appliedOn: "2026-05-20", status: "approved" },
  { id: "lv-5", staff: "Mia Robinson", staffId: "stf-6", type: "annual", from: "2026-06-15", to: "2026-06-16", days: 2, reason: "Long weekend.", appliedOn: "2026-06-02", status: "rejected" },
]

export const customers: Customer[] = [
  { id: "cus-1", name: "Hannah Price", email: "hannah.price@email.com", phone: "+44 7700 911001", visits: 14, totalSpent: 1280, lastVisit: "2026-06-11", status: "active" },
  { id: "cus-2", name: "Lucy Walsh", email: "lucy.walsh@email.com", phone: "+44 7700 911002", visits: 9, totalSpent: 980, lastVisit: "2026-06-11", status: "active" },
  { id: "cus-3", name: "Emily Shaw", email: "emily.shaw@email.com", phone: "+44 7700 911003", visits: 5, totalSpent: 410, lastVisit: "2026-06-11", status: "active" },
  { id: "cus-4", name: "Charlotte Webb", email: "charlotte.webb@email.com", phone: "+44 7700 911004", visits: 21, totalSpent: 2640, lastVisit: "2026-06-11", status: "active" },
  { id: "cus-5", name: "Freya Knight", email: "freya.knight@email.com", phone: "+44 7700 911005", visits: 3, totalSpent: 190, lastVisit: "2026-06-12", status: "active" },
  { id: "cus-6", name: "Daisy Cole", email: "daisy.cole@email.com", phone: "+44 7700 911006", visits: 1, totalSpent: 55, lastVisit: "2026-05-30", status: "inactive" },
  { id: "cus-7", name: "Poppy Hayes", email: "poppy.hayes@email.com", phone: "+44 7700 911007", visits: 7, totalSpent: 720, lastVisit: "2026-06-12", status: "active" },
  { id: "cus-8", name: "Ruby Marsh", email: "ruby.marsh@email.com", phone: "+44 7700 911008", visits: 11, totalSpent: 1450, lastVisit: "2026-06-13", status: "active" },
]

export const reviews: Review[] = [
  { id: "rev-1", customer: "Charlotte Webb", service: "Bridal Make-Up", rating: 5, comment: "Absolutely stunning work for my wedding day. Highly recommend!", date: "2026-06-09", published: true },
  { id: "rev-2", customer: "Hannah Price", service: "Signature Glow Facial", rating: 5, comment: "My skin has never looked better. Sophia is amazing.", date: "2026-06-08", published: true },
  { id: "rev-3", customer: "Lucy Walsh", service: "Balayage", rating: 4, comment: "Lovely colour, took a little longer than expected.", date: "2026-06-07", published: true },
  { id: "rev-4", customer: "Emily Shaw", service: "Gel Manicure", rating: 5, comment: "Perfect finish, lasted three weeks!", date: "2026-06-05", published: false },
  { id: "rev-5", customer: "Ruby Marsh", service: "Anti-Ageing Facial", rating: 3, comment: "Relaxing but a bit pricey for what it was.", date: "2026-06-02", published: false },
]

export const openingHours: OpeningHour[] = [
  { day: "Monday", open: "09:00", close: "18:00", closed: false },
  { day: "Tuesday", open: "09:00", close: "18:00", closed: false },
  { day: "Wednesday", open: "09:00", close: "18:00", closed: false },
  { day: "Thursday", open: "09:00", close: "20:00", closed: false },
  { day: "Friday", open: "09:00", close: "20:00", closed: false },
  { day: "Saturday", open: "08:30", close: "17:00", closed: false },
  { day: "Sunday", open: "10:00", close: "16:00", closed: true },
]

export const appointmentSettings: AppointmentSettings = {
  slotDurationMinutes: 30,
}

// ---- Dashboard ------------------------------------------------------------

export const revenueSeries = [
  { month: "Jan", revenue: 18200, appointments: 240 },
  { month: "Feb", revenue: 21400, appointments: 268 },
  { month: "Mar", revenue: 19800, appointments: 255 },
  { month: "Apr", revenue: 24600, appointments: 301 },
  { month: "May", revenue: 27200, appointments: 332 },
  { month: "Jun", revenue: 29800, appointments: 358 },
]

export const servicePopularity = [
  { name: "Hair", value: 34, color: "#2d3b64" },
  { name: "Facials", value: 24, color: "#4a5da0" },
  { name: "Nails", value: 18, color: "#7c8bc4" },
  { name: "Make-Up", value: 14, color: "#a6b1d8" },
  { name: "Waxing", value: 10, color: "#cdd3e8" },
]

export const weeklyBookings = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 38 },
  { day: "Wed", value: 51 },
  { day: "Thu", value: 64 },
  { day: "Fri", value: 72 },
  { day: "Sat", value: 88 },
  { day: "Sun", value: 29 },
]

export const dashboardStats = {
  revenueThisMonth: 29800,
  revenueChange: 9.6,
  appointmentsThisMonth: 358,
  appointmentsChange: 7.8,
  newCustomers: 46,
  newCustomersChange: 12.4,
  avgRating: 4.8,
  ratingChange: 0.2,
}
