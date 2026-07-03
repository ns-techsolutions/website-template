import Navbar from "./Navbar";
import { getPrimarySettings } from "@/lib/cms/public";

// Server wrapper that pulls the branding + header menu from CMS settings and
// renders the navbar. `overlay` decides the mode: true → transparent bar laid
// over a dark, full-bleed hero; false → solid (legible) bar for light pages.
// `getPrimarySettings` is request-cached, so calling it here as well as in the
// layout (for the footer) costs no extra query.
export async function PublicNavbar({ overlay }: { overlay: boolean }) {
  const { appearance, headerMenu } = await getPrimarySettings();
  return (
    <Navbar
      isAbsolute={overlay}
      logoSrc={appearance.logoLight || undefined}
      logoDarkSrc={appearance.logoDark || undefined}
      links={headerMenu.links}
      buttons={headerMenu.buttons}
    />
  );
}
