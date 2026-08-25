import { Coffee } from "lucide-react";
import { useEffect, useState } from "react";
import { useSiteContent } from "../contexts/SiteContentContext";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logoImage } = useSiteContent();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const smoothScrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Menu", href: "#menu" },
    { label: "Events", href: "#events" },
    { label: "Pray It Forward", href: "#pray-it-forward" },
    { label: "Community", href: "#community" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-cream-light/95 backdrop-blur-sm shadow-warm border-b border-[var(--accent-yellow-border)]"
          : "nav-over-hero border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => smoothScrollTo("hero")}
            className="flex items-center gap-2 group bg-transparent border-0 p-0 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-brown-dark flex items-center justify-center group-hover:bg-brown-mid transition-colors shadow-warm-sm ring-2 ring-[var(--accent-yellow)] ring-offset-1 overflow-hidden">
              {logoImage ? (
                <img
                  src={logoImage}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Coffee className="w-4 h-4 text-cream-light" />
              )}
            </div>
            <span
              className={`font-display text-lg font-semibold transition-colors ${isScrolled ? "text-brown-dark" : "text-cream-light drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]"}`}
            >
              Overflow of Jo
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => smoothScrollTo(link.href.replace(/^#/, ""))}
                className={`text-sm font-body transition-colors relative group bg-transparent border-0 p-0 cursor-pointer ${
                  isScrolled
                    ? "text-brown-mid hover:text-brown-dark"
                    : "text-cream-light hover:text-[var(--accent-yellow)] font-medium drop-shadow-[0_1px_5px_rgba(0,0,0,0.5)]"
                }`}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[var(--accent-yellow)] group-hover:w-full transition-all duration-300 rounded-full" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => smoothScrollTo("events")}
              className="px-4 py-2 rounded-sm text-sm font-body font-semibold text-brown-dark bg-[var(--accent-yellow)] border border-[var(--accent-yellow-border)] hover:bg-[var(--accent-yellow-hover)] hover:shadow-yellow-glow transition-all duration-200 cursor-pointer"
            >
              Book an Event
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className={`lg:hidden p-2 rounded-md transition-colors ${isScrolled ? "text-brown-mid hover:text-brown-dark hover:bg-[var(--accent-yellow)]/30" : "text-cream-light hover:text-[var(--accent-yellow)] hover:bg-white/10"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-current transition-all" />
          </button>
        </div>

        {/* Mobile Menu. The panel opacity is an arbitrary value because /98 is
            outside Tailwind's scale — as a plain modifier the utility is never
            generated and the panel renders transparent. */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-cream-light/[0.98] border-t border-[var(--accent-yellow-border)] py-4 px-2 shadow-warm">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                className="block w-full text-left py-2 px-3 text-sm font-body text-brown-mid hover:text-brown-dark hover:bg-[var(--accent-yellow)]/20 rounded transition-colors bg-transparent border-0 cursor-pointer"
                onClick={() => {
                  smoothScrollTo(link.href.replace(/^#/, ""));
                  setIsMobileMenuOpen(false);
                }}
              >
                {link.label}
              </button>
            ))}
            <div className="mt-3 px-3">
              <button
                type="button"
                className="block w-full text-center px-4 py-2 rounded-sm text-sm font-body font-semibold text-brown-dark bg-[var(--accent-yellow)] border border-[var(--accent-yellow-border)] hover:bg-[var(--accent-yellow-hover)] transition-all duration-200"
                onClick={() => {
                  smoothScrollTo("events");
                  setIsMobileMenuOpen(false);
                }}
              >
                Book an Event
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
