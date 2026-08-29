import Link from "next/link";
import Image from "next/image";
import { siteConfig, withBasePath } from "@/config/site";
import { Logo } from "./Logo";

const services = siteConfig.nav.filter((n) => n.href.startsWith("/services") || n.href === "/shower-remodels");

/**
 * Footer: a compact nav row for useful links, then a closing bar that
 * matches the original site's simple layout — address, crest, and a single
 * combined "Privacy Policy & Terms Of Service" button, with copyright below.
 */
export function Footer() {
  return (
    <footer
      className="relative text-teal-100/75"
      style={{ backgroundImage: `linear-gradient(rgb(14 14 14 / 0.88), rgb(14 14 14 / 0.94)), url(${withBasePath("/images/bg-black-marble.jpg")})`, backgroundSize: "auto, 420px" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo tone="dark" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Premium shower and bathroom remodeling — designed around your home,
              installed by our own certified team, and built to be enjoyed every day.
            </p>
            <ul className="mt-5 flex gap-3">
              {siteConfig.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-teal-100 transition-colors hover:border-teal-400 hover:text-teal-300"
                  >
                    <span className="sr-only">{s.label}</span>
                    {s.label === "Facebook" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5h1.65V4.6c-.3-.04-1.3-.12-2.5-.12-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V14h2.7v8h3.5Z"/></svg>
                    )}
                    {s.label === "Instagram" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.3" fill="currentColor" stroke="none"/></svg>
                    )}
                    {s.label === "Houzz" && (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 2v8l6-2V2h6v20h-6v-8l-6 2v6H6V2Z" opacity="0.9"/></svg>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer — services">
            <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-white">Services</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="transition-colors hover:text-teal-300">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer — quick links">
            <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/" className="transition-colors hover:text-teal-300">Home</Link></li>
              <li><Link href="/gallery" className="transition-colors hover:text-teal-300">Project Gallery</Link></li>
              <li><Link href="/#before-after" className="transition-colors hover:text-teal-300">Before &amp; After</Link></li>
              <li><Link href="/#free-estimate" className="transition-colors hover:text-teal-300">Free Estimate</Link></li>
              <li><a href={siteConfig.bookingUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-teal-300">Book an Appointment</a></li>
              <li><Link href="/contact" className="transition-colors hover:text-teal-300">Contact Us</Link></li>
            </ul>
          </nav>

          <div>
            <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={siteConfig.phoneHref} className="font-semibold text-white transition-colors hover:text-teal-300">
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              {siteConfig.email && (
                <li>
                  <a href={`mailto:${siteConfig.email}`} className="transition-colors hover:text-teal-300">
                    {siteConfig.email}
                  </a>
                </li>
              )}
              <li className="pt-1 text-teal-100/60">
                <span className="font-semibold text-teal-100/85">Service area:</span>{" "}
                {siteConfig.serviceArea.localities.join(" · ")}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Closing bar — matches the original site's simple footer layout */}
      <div className="border-t border-white/10 bg-black/25">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 text-center sm:px-6 md:grid-cols-3 md:text-left">
          <p className="text-sm text-teal-100/80">
            {siteConfig.address.street}
            <br />
            {siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.zip}
          </p>
          <div className="flex justify-center">
            <Image
              src={withBasePath("/images/logo-crest.jpg")}
              alt="Bathroom Excellence crest"
              width={140}
              height={128}
              className="h-24 w-auto rounded-lg border border-white/10"
            />
          </div>
          <div className="flex justify-center md:justify-end">
            <Link
              href="/privacy-policy"
              className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-card transition-colors hover:bg-porcelain"
            >
              Privacy Policy &amp; Terms Of Service
            </Link>
          </div>
        </div>
        <p className="border-t border-white/10 px-4 py-5 text-center text-xs text-teal-100/50 sm:px-6">
          © {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
