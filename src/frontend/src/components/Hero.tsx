import { ChevronDown } from "lucide-react";
import { useSiteContent } from "../contexts/SiteContentContext";
import { CONTENT_KEYS, getText } from "../hooks/useContentOverrides";

const smoothScrollTo = (id: string) => {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const DEFAULT_HERO_BG = "/assets/generated/hero-bg.dim_1440x900.png";

const textBg: React.CSSProperties = {
  backgroundColor: "rgba(50, 28, 14, 0.45)",
  borderRadius: "6px",
  padding: "2px 12px",
  display: "inline",
};

export default function Hero() {
  const { overrides, heroImage } = useSiteContent();
  const heroBg = heroImage ?? DEFAULT_HERO_BG;

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${heroBg}')` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-brown-dark/55" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Decorative yellow accent line above title */}
        <div className="flex items-center justify-center mb-6">
          <div className="h-px w-16 bg-[var(--accent-yellow)] opacity-80" />
          <div className="mx-3 w-2 h-2 rounded-full bg-[var(--accent-yellow)] opacity-90" />
          <div className="h-px w-16 bg-[var(--accent-yellow)] opacity-80" />
        </div>

        <h1
          className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-cream-light mb-4 animate-fade-in-up leading-tight"
          data-content-key={CONTENT_KEYS["hero.title"]}
        >
          <span style={textBg}>
            {getText(overrides, CONTENT_KEYS["hero.title"], "Overflow of Jo")}
          </span>
        </h1>

        {/* Yellow underline accent under title */}
        <div className="flex justify-center mb-6">
          <div className="h-1 w-24 rounded-full bg-[var(--accent-yellow)] opacity-85" />
        </div>

        <p
          className="font-display text-lg sm:text-xl font-semibold animate-fade-in-up animation-delay-100 max-w-2xl mx-auto mb-3"
          style={{
            color: "var(--accent-yellow)",
            textShadow: "0 1px 8px rgba(0,0,0,0.60)",
            letterSpacing: "0.04em",
          }}
          data-content-key={CONTENT_KEYS["hero.tagline"]}
        >
          <span style={textBg}>
            {getText(
              overrides,
              CONTENT_KEYS["hero.tagline"],
              "Faith-Fueled Coffee",
            )}
          </span>
        </p>
        <p
          className="font-body text-base sm:text-lg font-semibold text-cream-light mb-10 animate-fade-in-up animation-delay-200 max-w-xl mx-auto"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}
          data-content-key={CONTENT_KEYS["hero.location"]}
        >
          <span style={textBg}>
            {getText(
              overrides,
              CONTENT_KEYS["hero.location"],
              "Inside Wave Wilson Church · Wilson, NC",
            )}
          </span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
          <button
            type="button"
            onClick={() => smoothScrollTo("events")}
            data-ocid="hero.primary_button"
            data-content-key={CONTENT_KEYS["hero.cta1"]}
            className="px-8 py-3 font-body font-semibold text-brown-dark rounded-sm transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: "#E8C84A",
              border: "2px solid #C9A832",
              opacity: 1,
            }}
          >
            {getText(overrides, CONTENT_KEYS["hero.cta1"], "Explore Events")}
          </button>
          <button
            type="button"
            onClick={() => smoothScrollTo("about")}
            data-content-key={CONTENT_KEYS["hero.cta2"]}
            className="px-8 py-3 font-body font-semibold text-cream-light border-2 border-[var(--accent-yellow)] rounded-sm hover:bg-[var(--accent-yellow)]/20 hover:text-cream-light transition-all duration-200 cursor-pointer"
          >
            {getText(overrides, CONTENT_KEYS["hero.cta2"], "Our Mission")}
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-[var(--accent-yellow)] opacity-80" />
      </div>
    </section>
  );
}
