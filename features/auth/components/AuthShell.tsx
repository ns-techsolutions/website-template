import Link from "next/link";

// Shared page chrome for the public sign-in / sign-up blocks. Renders an
// optional side image (split layout) or a centered card, with the CMS-editable
// eyebrow / heading / subtitle and footer link around the form passed as children.

export interface AuthShellProps {
  eyebrow?: string;
  heading?: string;
  subtitle?: string;
  image?: string;
  footerText?: string;
  footerLinkLabel?: string;
  footerLinkUrl?: string;
}

export function AuthShell({
  eyebrow,
  heading,
  subtitle,
  image,
  footerText,
  footerLinkLabel,
  footerLinkUrl,
  children,
}: AuthShellProps & { children: React.ReactNode }) {
  const inner = (
    <>
      <div className="text-center">
        {eyebrow && <p className="reine-eyebrow mb-3">{eyebrow}</p>}
        {heading && <h1 className="font-heading text-3xl md:text-4xl">{heading}</h1>}
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="mt-6">{children}</div>
      {footerText && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {footerText}{" "}
          {footerLinkLabel && (
            <Link
              href={footerLinkUrl || "#"}
              className="font-semibold text-foreground hover:underline"
            >
              {footerLinkLabel}
            </Link>
          )}
        </p>
      )}
    </>
  );

  return (
    <section className="bg-secondary py-20 md:py-28">
      <div className="reine-container">
        {image ? (
          <div className="mx-auto grid max-w-4xl grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-sm md:grid-cols-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="hidden h-full w-full object-cover md:block" />
            <div className="p-8 md:p-10">{inner}</div>
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm md:p-10">
            {inner}
          </div>
        )}
      </div>
    </section>
  );
}
