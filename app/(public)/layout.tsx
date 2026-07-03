import type { Metadata } from "next";

import Footer from "@/components/common/Footer";
import { AuthProvider } from "@/components/common/auth/auth-context";
import { getPrimarySettings } from "@/lib/cms/public";

export async function generateMetadata(): Promise<Metadata> {
  const { appearance } = await getPrimarySettings();
  const brand = appearance.brandName || "Reine Studio";
  // seoTitleTemplate uses %s for the page title (e.g. "%s | Brand").
  const template = appearance.seoTitleTemplate?.includes("%s")
    ? appearance.seoTitleTemplate
    : "%s";

  return {
    title: { default: brand, template },
    description: appearance.seoDescription || undefined,
    openGraph: appearance.ogImage ? { images: [appearance.ogImage] } : undefined
  };
}

export default async function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPrimarySettings();
  const { appearance, footerColumns, socialLinks } = settings;

  return (
    <div className="min-h-full flex flex-col">
      <AuthProvider>
        {/* The navbar is rendered per-page (see PublicNavbar) so its mode can
            adapt to the page's first block — transparent over a dark hero, solid
            on light pages. Layouts don't re-render on navigation, so the page is
            the right place to decide. */}
        {children}
        <Footer
          brandName={appearance.brandName || undefined}
          columns={footerColumns.columns}
          copyright={footerColumns.copyright}
          legalLinks={footerColumns.legalLinks}
          social={socialLinks}
        />
      </AuthProvider>
    </div>
  );
}
