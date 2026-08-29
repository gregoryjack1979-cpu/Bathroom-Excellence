"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

const PhoneIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

/** Sticky glass header: brand + phone + estimate CTA, service nav beneath. */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass-panel shadow-card" : "border-b border-white/40 bg-white/38 backdrop-blur-md",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* top row */}
        <div
          className={clsx(
            "flex items-center justify-between gap-4 transition-[padding] duration-300",
            scrolled ? "py-2.5" : "py-4",
          )}
        >
          <Link href="/" aria-label={`${siteConfig.name} — home`} className="shrink-0">
            <Logo />
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            <a
              href={siteConfig.phoneHref}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-teal-600"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-50 text-teal-600 transition-transform group-hover:scale-110">
                {PhoneIcon}
              </span>
              {siteConfig.phoneDisplay}
            </a>
            <Button href="/#free-estimate" size="md">
              Get a Free Estimate
            </Button>
          </div>

          {/* mobile: phone + burger */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={siteConfig.phoneHref}
              aria-label={`Call ${siteConfig.phoneDisplay}`}
              className="grid h-11 w-11 place-items-center rounded-full bg-teal-50 text-teal-700"
            >
              {PhoneIcon}
            </a>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-full border border-chrome/70 bg-white/70 text-ink"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* nav row (desktop) */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul
            className={clsx(
              "-mx-2 flex flex-wrap items-center justify-center gap-x-0.5 border-t border-ink/5 transition-[padding] duration-300",
              scrolled ? "py-1.5" : "py-2.5",
            )}
          >
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={clsx(
                    "relative rounded-full px-2 py-1.5 text-xs font-medium transition-colors xl:px-3 xl:text-[13px]",
                    isActive(item.href)
                      ? "bg-teal-600/10 text-teal-700"
                      : "text-body hover:bg-ink/5 hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
