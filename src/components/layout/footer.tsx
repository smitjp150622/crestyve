import Link from "next/link";
import { Mail } from "lucide-react";

const footerLinks = {
  collections: [
    { href: "/collections", label: "Hand Painted" },
    { href: "/collections", label: "Limited Edition" },
    { href: "/collections", label: "Custom" },
    { href: "/collections", label: "Canvas Art" },
  ],
  explore: [
    { href: "/about", label: "About" },
    { href: "/gallery", label: "Gallery" },
    { href: "/lookbook", label: "Lookbook" },
    { href: "/journal", label: "Journal" },
  ],
  connect: [
    { href: "https://wa.me/918884942210", label: "WhatsApp", external: true },
    { href: "https://instagram.com/crestyve", label: "Instagram", external: true },
    { href: "mailto:hello@crestyve.com", label: "Email", external: true },
    { href: "/contact", label: "Contact" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <h2 className="font-cormorant text-[28px] font-semibold tracking-wide">
                CRESTYVE
              </h2>
            </Link>
            <p className="font-inter text-[13px] text-white/40 mt-3 max-w-[320px] leading-[1.7]">
              Wear Your Story. Luxury handcrafted fashion where every piece is
              one of one, painted with passion.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://instagram.com/crestyve"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-white/15 hover:border-white/40 transition-colors duration-300"
                aria-label="Instagram"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a
                href="https://wa.me/918884942210"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-white/15 hover:border-white/40 transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href="mailto:hello@crestyve.com"
                className="w-9 h-9 flex items-center justify-center border border-white/15 hover:border-white/40 transition-colors duration-300"
                aria-label="Email"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h3 className="font-manrope text-[10px] tracking-[0.2em] uppercase text-white/30 mb-5 font-medium">
              Collections
            </h3>
            <ul className="space-y-3">
              {footerLinks.collections.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-inter text-[13px] text-white/50 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-manrope text-[10px] tracking-[0.2em] uppercase text-white/30 mb-5 font-medium">
              Explore
            </h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-inter text-[13px] text-white/50 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-manrope text-[10px] tracking-[0.2em] uppercase text-white/30 mb-5 font-medium">
              Connect
            </h3>
            <ul className="space-y-3">
              {footerLinks.connect.map((link) =>
                "external" in link && link.external ? (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-inter text-[13px] text-white/50 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-inter text-[13px] text-white/50 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-inter text-[11px] text-white/30">
            © {new Date().getFullYear()} CRESTYVE. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="font-inter text-[11px] text-white/30 hover:text-white/60 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="font-inter text-[11px] text-white/30 hover:text-white/60 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
