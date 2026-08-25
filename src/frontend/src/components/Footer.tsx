import { Coffee, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import {
  CONTENT_KEYS,
  getText,
  useContentOverrides,
} from "../hooks/useContentOverrides";
import { STORAGE_KEYS, getSiteImageFromBackend } from "../utils/adminStorage";

export default function Footer() {
  const year = new Date().getFullYear();
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const { overrides } = useContentOverrides();

  useEffect(() => {
    getSiteImageFromBackend(STORAGE_KEYS.LOGO_IMAGE).then((val) => {
      setLogoImage(val);
    });
  }, []);

  return (
    <footer className="bg-brown-dark text-cream-light py-14">
      {/* Yellow accent divider at top */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px w-full bg-[var(--accent-yellow)]/30 mb-10" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-yellow)]/20 border border-[var(--accent-yellow)]/50 flex items-center justify-center overflow-hidden">
                {logoImage ? (
                  <img
                    src={logoImage}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Coffee className="w-4 h-4 text-[var(--accent-yellow)]" />
                )}
              </div>
              <span className="font-display text-lg font-semibold text-cream-light">
                Overflow of Jo
              </span>
            </div>
            <p
              className="font-body text-sm text-cream-light/60 leading-relaxed mb-5"
              data-content-key={CONTENT_KEYS["footer.desc"]}
            >
              {getText(
                overrides,
                CONTENT_KEYS["footer.desc"],
                "A faith-inspired coffee shop inside Wave Wilson Church, Wilson, NC. Where community gathers and grace overflows.",
              )}
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/overflowofjo/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="group w-8 h-8 rounded-full bg-cream-light/10 border border-[var(--accent-yellow)]/20 flex items-center justify-center hover:bg-[var(--accent-yellow)]/20 hover:border-[var(--accent-yellow)]/60 transition-all duration-200"
              >
                <SiInstagram className="w-3.5 h-3.5 text-cream-light/60 group-hover:text-[var(--accent-yellow)] transition-colors" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="group w-8 h-8 rounded-full bg-cream-light/10 border border-[var(--accent-yellow)]/20 flex items-center justify-center hover:bg-[var(--accent-yellow)]/20 hover:border-[var(--accent-yellow)]/60 transition-all duration-200"
              >
                <SiFacebook className="w-3.5 h-3.5 text-cream-light/60 group-hover:text-[var(--accent-yellow)] transition-colors" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="group w-8 h-8 rounded-full bg-cream-light/10 border border-[var(--accent-yellow)]/20 flex items-center justify-center hover:bg-[var(--accent-yellow)]/20 hover:border-[var(--accent-yellow)]/60 transition-all duration-200"
              >
                <SiX className="w-3.5 h-3.5 text-cream-light/60 group-hover:text-[var(--accent-yellow)] transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-base font-semibold text-cream-light mb-1">
              Quick Links
            </h4>
            <div className="h-0.5 w-8 rounded-full bg-[var(--accent-yellow)] mb-4" />
            <ul className="space-y-2">
              {[
                { label: "About Us", href: "#about" },
                { label: "Our Menu", href: "#menu" },
                { label: "Events & Booking", href: "#events" },
                { label: "Pray It Forward", href: "#pray-it-forward" },
                { label: "Community", href: "#community" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-body text-sm text-cream-light/60 hover:text-[var(--accent-yellow)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-base font-semibold text-cream-light mb-1">
              Get In Touch
            </h4>
            <div className="h-0.5 w-8 rounded-full bg-[var(--accent-yellow)] mb-4" />
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-[var(--accent-yellow)]" />
              <a
                href={`mailto:${getText(overrides, CONTENT_KEYS["footer.contact.email"], "hello@overflowofjo.com")}`}
                data-content-key={CONTENT_KEYS["footer.contact.email"]}
                className="font-body text-sm text-cream-light/60 hover:text-[var(--accent-yellow)] transition-colors"
              >
                {getText(
                  overrides,
                  CONTENT_KEYS["footer.contact.email"],
                  "hello@overflowofjo.com",
                )}
              </a>
            </div>
            <p
              className="font-body text-sm text-cream-light/60 leading-relaxed whitespace-pre-line"
              data-content-key={CONTENT_KEYS["footer.contact.address"]}
            >
              {getText(
                overrides,
                CONTENT_KEYS["footer.contact.address"],
                "Wave Wilson Church\n5334 Lamm Rd\nWilson, NC 27893",
              )}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="h-px w-full bg-[var(--accent-yellow)]/20 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-body text-cream-light/40">
          <p data-content-key={CONTENT_KEYS["footer.copyright"]}>
            {getText(
              overrides,
              CONTENT_KEYS["footer.copyright"],
              `© ${year} Overflow of Jo. All rights reserved.`,
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
