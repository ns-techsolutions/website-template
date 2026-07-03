import type { Permission } from "@/lib/admin/types";

// The fixed catalog of capability keys a Role can grant. This is product
// configuration (the same for every salon), so it lives in code rather than the
// database. Roles persist only the subset of keys they grant.
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
  { key: "customers.manage", label: "Manage customers", group: "Customers" },
  { key: "reviews.manage", label: "Manage reviews", group: "Reviews" },
  { key: "settings.manage", label: "Manage settings", group: "Settings" },
];

export const permissionKeys: string[] = permissionCatalog.map((p) => p.key);

export interface DefaultRole {
  name: string;
  description: string;
  permissions: string[];
}

// Starter roles seeded into every new salon database (see seedTenantDatabase).
export const DEFAULT_ROLES: DefaultRole[] = [
  {
    name: "Administrator",
    description: "Full access to every part of the system.",
    permissions: permissionKeys,
  },
  {
    name: "Manager",
    description: "Runs day-to-day operations and staff.",
    permissions: [
      "dashboard.view",
      "appointments.view",
      "appointments.manage",
      "services.view",
      "services.manage",
      "staff.view",
      "staff.manage",
      "leave.view",
      "leave.approve",
      "customers.view",
      "reviews.manage",
    ],
  },
  {
    name: "Receptionist",
    description: "Handles bookings and customer enquiries.",
    permissions: [
      "dashboard.view",
      "appointments.view",
      "appointments.manage",
      "customers.view",
    ],
  },
  {
    name: "Stylist",
    description: "Service provider with limited access.",
    permissions: ["dashboard.view", "appointments.view", "leave.view"],
  },
];
