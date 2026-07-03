"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "../ui/sheet";
import { MenuIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuth, initials } from "./auth/auth-context";
import type { NavButton } from "@/lib/admin/types";

// Tracks whether the page has been scrolled past `threshold` pixels.
// Initial value is `false` so it matches the server-rendered (top) state.
function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll(); // sync on mount (e.g. page restored mid-scroll)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

interface NavLink {
  label: string;
  url: string;
}

interface NavbarProps {
  logoSrc?: string;
  logoDarkSrc?: string;
  isAbsolute?: boolean;
  links?: NavLink[];
  buttons?: NavButton[];
}

const DEFAULT_LINKS: NavLink[] = [
  { label: "Home", url: "/" },
  { label: "Services", url: "/services" },
  { label: "About Us", url: "/about" },
  { label: "Contact Us", url: "/contact" }
];

const DEFAULT_BUTTONS: NavButton[] = [
  { id: "book", label: "Book Online", type: "link", url: "/book-appointment", dividerBefore: false }
];

// Full-width outline button used by the mobile sheet's action stack.
const MOBILE_BTN_CLASS =
  "inline-flex h-[3.5rem] w-full items-center justify-center border border-black px-8 text-[1rem] font-semibold tracking-[0.1em] uppercase transition-colors hover:bg-black hover:text-white";

export default function Navbar({
  logoSrc = "/images/reine/logo-white.png",
  logoDarkSrc = "/images/reine/logo.png",
  isAbsolute = true,
  links,
  buttons
}: NavbarProps) {
  const { user, openSignIn, openSignUp, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled();
  // Overlay mode (isAbsolute) starts transparent over a dark hero and flips to
  // the solid look on scroll. Non-overlay pages have no dark hero behind the bar,
  // so they render the solid look from the top — otherwise the white text would
  // be invisible on a light page.
  const solid = !isAbsolute || scrolled;
  const navLinks = links && links.length > 0 ? links : DEFAULT_LINKS;
  const navButtons =
    buttons && buttons.length > 0 ? buttons : DEFAULT_BUTTONS;

  const openFor = (type: NavButton["type"]) =>
    type === "signup" ? openSignUp : openSignIn;

  // Shared white pill used by the CTA and Sign In button; the border/hover
  // colors flip between the transparent (over-hero) and solid states.
  const pillClass = `inline-flex h-10 items-center justify-center rounded-full border px-5 text-[0.9rem] font-semibold tracking-[0.08em] uppercase transition-colors ${
    solid
      ? "border-neutral-900 hover:bg-neutral-900 hover:text-white"
      : "border-white hover:bg-white hover:text-black"
  }`;

  return (
    <header
      className={`${
        isAbsolute ? "fixed inset-x-0 top-0" : "sticky top-0"
      } z-50 transition-all duration-300 ${
        solid
          ? "bg-white text-neutral-900 shadow-sm py-3 lg:py-4"
          : "text-white pt-8 lg:pt-9"
      }`}
    >
      <div
        className={`reine-container flex justify-between gap-4 ${
          solid ? "items-center" : "items-start"
        }`}
      >
        <Link href="/" aria-label="Go to home" className="shrink-0">
          <img
            src={solid ? logoDarkSrc : logoSrc}
            alt="Reine Beauty Studio"
            className={`w-auto transition-all duration-300 ${
              solid ? "h-9 md:h-10" : "h-12 md:h-14"
            }`}
          />
        </Link>

        <div className="hidden items-center gap-6 whitespace-nowrap xl:flex">
          <nav>
            <ul className="flex items-center gap-7 text-[0.9rem] font-semibold tracking-[0.08em] uppercase">
              {navLinks.map((l) => (
                <li key={l.url}>
                  <Link
                    href={l.url}
                    className={`transition-colors ${
                      solid
                        ? "hover:text-neutral-900/60"
                        : "hover:text-white/80"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {navButtons.map((b) => {
            // Auth buttons have nothing to do once signed in.
            if (b.type !== "link" && user) return null;
            return (
              <Fragment key={b.id}>
                {b.dividerBefore && (
                  <span
                    className={`h-5 w-px ${solid ? "bg-black/15" : "bg-white/30"}`}
                    aria-hidden="true"
                  />
                )}
                {b.type === "link" ? (
                  <Link href={b.url} className={pillClass}>
                    {b.label}
                  </Link>
                ) : (
                  <button type="button" onClick={openFor(b.type)} className={pillClass}>
                    {b.label}
                  </button>
                )}
              </Fragment>
            );
          })}

          {user && (
            <>
              <span
                className={`h-5 w-px ${solid ? "bg-black/15" : "bg-white/30"}`}
                aria-hidden="true"
              />
              <Link
                href="/account"
                aria-label="My account"
                className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
              >
                <Avatar
                  className={`size-9 border ${
                    solid ? "border-black/15" : "border-white/40"
                  }`}
                >
                  <AvatarFallback
                    className={`text-sm font-semibold ${
                      solid
                        ? "bg-black/5 text-neutral-900"
                        : "bg-white/15 text-white"
                    }`}
                  >
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[0.9rem] font-semibold tracking-[0.04em]">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
            </>
          )}
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            className={`z-50 transition-colors xl:hidden ${
              solid
                ? "text-neutral-900 hover:text-neutral-900/70"
                : "text-white hover:text-white/80"
            }`}
            aria-label="Toggle menu"
          >
            <MenuIcon className="h-10 w-10" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-white text-black border-none pt-24 px-6 overflow-y-auto"
          >
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <nav className="flex h-full flex-col">
              {user && (
                <div className="mb-8 flex items-center gap-3">
                  <Avatar className="size-11 border border-black/10">
                    <AvatarFallback className="bg-black text-sm font-semibold text-white">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col leading-tight">
                    <span className="text-base font-semibold">{user.name}</span>
                    <span className="text-sm text-black/60">{user.email}</span>
                  </div>
                </div>
              )}
              <ul className="flex flex-col gap-6 text-xl font-semibold tracking-[0.08em] uppercase">
                {navLinks.map((l) => (
                  <li key={l.url}>
                    <Link
                      href={l.url}
                      onClick={() => setMenuOpen(false)}
                      className="transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                {user && (
                  <li>
                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="transition-colors hover:text-primary"
                    >
                      My Account
                    </Link>
                  </li>
                )}
              </ul>

              <div className="mt-8 flex flex-col gap-3 relative z-50">
                {user && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className={MOBILE_BTN_CLASS}
                  >
                    Log Out
                  </button>
                )}
                {navButtons.map((b) =>
                  b.type === "link" ? (
                    <Link
                      key={b.id}
                      href={b.url}
                      onClick={() => setMenuOpen(false)}
                      className={MOBILE_BTN_CLASS}
                    >
                      {b.label}
                    </Link>
                  ) : user ? null : (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        openFor(b.type)();
                      }}
                      className={MOBILE_BTN_CLASS}
                    >
                      {b.label}
                    </button>
                  )
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
