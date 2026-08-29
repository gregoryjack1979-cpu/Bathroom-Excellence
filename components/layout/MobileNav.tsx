"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { Logo } from "./Logo";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

/** Full-height slide-in drawer with staggered links and focus trapping. */
export function MobileNav({ open, onClose }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useFocusTrap(panelRef, open);

  // Portal to <body>: the blurred header creates a containing block that
  // would otherwise trap (and clip) this fixed drawer.
  useEffect(() => setMounted(true), []);

  // Close on route change + Escape; lock body scroll while open.
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-deep/45 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            id="mobile-nav"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-y-0 right-0 z-[70] flex w-[min(22rem,88vw)] flex-col overflow-y-auto bg-porcelain shadow-lift lg:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <Logo />
              <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full border border-chrome/70 text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 px-3 py-4">
              <ul>
                {siteConfig.nav.map((item, i) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.035, duration: 0.3 }}
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={clsx(
                          "block rounded-xl px-4 py-3 text-[15px] font-medium",
                          active ? "bg-teal-600/10 text-teal-700" : "text-ink hover:bg-ink/5",
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <div className="space-y-3 border-t border-ink/10 px-5 py-5">
              <Button href="/#free-estimate" className="w-full">
                Get a Free Estimate
              </Button>
              <Button href={siteConfig.phoneHref} variant="outline" className="w-full">
                Call {siteConfig.phoneDisplay}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
