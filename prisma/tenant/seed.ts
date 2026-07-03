import { PrismaClient, Prisma } from "@prisma/client";

import { loadEnv } from "../../scripts/_env";
import { hashPassword } from "../../lib/auth/password";
import {
  cmsPages,
  mediaAssets,
  headerMenu,
  headerButtons,
  footerColumns,
  footerCopyright,
  socialLinks,
  siteAppearance,
} from "../../lib/admin/cms-data";
import {
  serviceCategories,
  services as serviceList,
  staff as staffList,
  openingHours,
  appointmentSettings,
  customers as customerList,
  appointments as appointmentList,
} from "../../lib/admin/data";

loadEnv();

// Seeds ONE salon database (pointed at by DATABASE_URL) with its single
// workspace, demo CMS content, and a bound tenant admin. Idempotent.
//
// Run: DATABASE_URL="postgres://…/salon_reine" tsx prisma/tenant/seed.ts

const prisma = new PrismaClient();
const json = (v: unknown) => v as unknown as Prisma.InputJsonValue;

const WORKSPACE = {
  name: process.env.TENANT_NAME ?? "Reine Studio",
  slug: process.env.TENANT_SLUG ?? "reine",
  domain: process.env.TENANT_DOMAIN ?? "reine.com",
};
const ADMIN_EMAIL = process.env.TENANT_ADMIN_EMAIL ?? "owner@reine.com";
const ADMIN_PASSWORD = process.env.TENANT_ADMIN_PASSWORD ?? "Owner@12345";

async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { slug: WORKSPACE.slug },
    update: { isPrimary: true },
    create: {
      name: WORKSPACE.name,
      slug: WORKSPACE.slug,
      domain: WORKSPACE.domain,
      plan: "pro",
      status: "active",
      accent: "#2d3b64",
      owner: WORKSPACE.name,
      isPrimary: true,
    },
  });

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "tenant", workspaceId: workspace.id },
    create: {
      name: "Salon Admin",
      email: ADMIN_EMAIL,
      password: await hashPassword(ADMIN_PASSWORD),
      role: "tenant",
      workspaceId: workspace.id,
    },
  });

  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { workspaceId_slug: { workspaceId: workspace.id, slug: page.slug } },
      update: {
        title: page.title,
        status: page.status,
        blocks: json(page.blocks),
        seo: json(page.seo),
      },
      create: {
        workspaceId: workspace.id,
        title: page.title,
        slug: page.slug,
        status: page.status,
        blocks: json(page.blocks),
        seo: json(page.seo),
      },
    });
  }

  for (const m of mediaAssets) {
    await prisma.mediaAsset.upsert({
      where: { id: m.id },
      update: {
        workspaceId: workspace.id,
        name: m.name,
        url: m.url,
        sizeKb: m.sizeKb,
        width: m.width,
        height: m.height,
      },
      create: {
        id: m.id,
        workspaceId: workspace.id,
        name: m.name,
        url: m.url,
        sizeKb: m.sizeKb,
        width: m.width,
        height: m.height,
        uploadedAt: new Date(m.uploadedAt),
      },
    });
  }

  await prisma.siteSettings.upsert({
    where: { workspaceId: workspace.id },
    update: {
      appearance: json(siteAppearance),
      headerMenu: json({ links: headerMenu, buttons: headerButtons }),
      footerColumns: json({ columns: footerColumns, copyright: footerCopyright }),
      socialLinks: json(socialLinks),
    },
    create: {
      workspaceId: workspace.id,
      appearance: json(siteAppearance),
      headerMenu: json({ links: headerMenu, buttons: headerButtons }),
      footerColumns: json({ columns: footerColumns, copyright: footerCopyright }),
      socialLinks: json(socialLinks),
    },
  });

  // ---- Core operations: catalog, staff, opening hours --------------------
  for (const c of serviceCategories) {
    const data = {
      workspaceId: workspace.id,
      name: c.name,
      description: c.description,
      status: c.status,
    };
    await prisma.serviceCategory.upsert({
      where: { id: c.id },
      update: data,
      create: { id: c.id, ...data },
    });
  }

  for (const s of serviceList) {
    const data = {
      workspaceId: workspace.id,
      categoryId: s.categoryId,
      name: s.name,
      description: s.description,
      price: s.price,
      duration: s.duration,
      status: s.status,
    };
    await prisma.service.upsert({
      where: { id: s.id },
      update: data,
      create: { id: s.id, ...data },
    });
  }

  for (const st of staffList) {
    const data = {
      workspaceId: workspace.id,
      name: st.name,
      email: st.email,
      phone: st.phone,
      role: st.role,
      roleId: st.roleId,
      specialties: st.specialties,
      status: st.status,
      joinedDate: st.joinedDate,
    };
    await prisma.staff.upsert({
      where: { id: st.id },
      update: data,
      create: { id: st.id, ...data },
    });
  }

  await prisma.salonSettings.upsert({
    where: { workspaceId: workspace.id },
    update: {
      openingHours: json(openingHours),
      slotDurationMinutes: appointmentSettings.slotDurationMinutes,
    },
    create: {
      workspaceId: workspace.id,
      openingHours: json(openingHours),
      slotDurationMinutes: appointmentSettings.slotDurationMinutes,
    },
  });

  // ---- Customers (Users) + their bookings --------------------------------
  const customerPassword = await hashPassword("Customer@12345");
  const emailByName = new Map<string, string>();
  for (const cust of customerList) {
    emailByName.set(cust.name, cust.email);
    await prisma.user.upsert({
      where: { email: cust.email },
      update: { name: cust.name, phone: cust.phone, role: "customer" },
      create: {
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        password: customerPassword,
        role: "customer",
      },
    });
  }

  const serviceByName = new Map(serviceList.map((s) => [s.name, s]));
  const staffByName = new Map(staffList.map((s) => [s.name, s]));
  const emailSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/(^\.|\.$)/g, "");

  for (const apt of appointmentList) {
    const svc = serviceByName.get(apt.service);
    const stf = staffByName.get(apt.staff);
    const email = emailByName.get(apt.customer) ?? `${emailSlug(apt.customer)}@email.com`;
    const owner = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    const status = (apt.status === "no-show" ? "no_show" : apt.status) as
      | "pending"
      | "confirmed"
      | "completed"
      | "cancelled"
      | "no_show";
    const data = {
      customerName: apt.customer,
      email,
      phone: apt.phone,
      service: apt.service,
      staff: apt.staff,
      serviceId: svc?.id ?? null,
      staffId: stf?.id ?? null,
      price: apt.price,
      duration: apt.duration,
      date: new Date(apt.date),
      time: apt.time,
      status,
      userId: owner?.id ?? null,
    };
    await prisma.booking.upsert({
      where: { reference: apt.reference },
      update: data,
      create: { reference: apt.reference, ...data },
    });
  }

  console.log(
    `Seeded salon "${WORKSPACE.name}" (${WORKSPACE.slug}) with ` +
      `${cmsPages.length} pages, ` +
      `${mediaAssets.length} media assets, ${serviceCategories.length} categories, ` +
      `${serviceList.length} services, ${staffList.length} staff, ` +
      `${customerList.length} customers, ${appointmentList.length} bookings. ` +
      `Admin: ${ADMIN_EMAIL}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
