import { ChevronDown } from "lucide-react";
import { useSiteContent } from "../contexts/SiteContentContext";
import { CONTENT_KEYS, getText } from "../hooks/useContentOverrides";
import { DEFAULT_HERO_POSTER, resolveHeroMedia } from "../utils/heroMedia";

const smoothScrollTo = (id: string) => {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

/** Type sits directly on the scrim, so it carries its own shadow instead. */
const textShadow =
  "0 2px 18px rgba(0, 0, 0, 0.55), 0 1px 3px rgba(0, 0, 0, 0.4)";

export default function Hero() {
  const { overrides, heroImage } = useSiteContent();
  const media = resolveHeroMedia(heroImage);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-brown-dark"
    >
      {/* Background media — the brand film by default, or whatever the admin
          panel has saved for this slot. */}
      {media.kind === "video" ? (
        <video
          key={media.src}
          src={media.src}
          poster={media.isDefault ? DEFAULT_HERO_POSTER : undefined}
          autoPlay
          loop
          muted
          playsInline
          controlsList="nodownload"
          disablePictureInPicture
          preload="auto"
          // Decorative: hidden from assistive tech and out of the tab order.
          aria-hidden="true"
          tabIndex={-1}
          className="hero-background-video"
        />
      ) : (
        <img
          src={media.src}
          alt=""
          aria-hidden="true"
          className="hero-background-video"
        />
      )}

      {/* Readability scrim */}
      <div className="hero-scrim" aria-hidden="true" />

      {/* Content — centred on phones, held to the left half from md up so the
          right side of the film stays clear. */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-36 md:py-28">
        <div className="flex flex-col items-center text-center md:items-start md:text-left md:max-w-xl">
          {/* Decorative yellow accent line above title */}
          <div className="flex items-center justify-center md:justify-start mb-6">
            <div className="h-px w-16 bg-[var(--accent-yellow)] opacity-80" />
            <div className="mx-3 w-2 h-2 rounded-full bg-[var(--accent-yellow)] opacity-90" />
            <div className="h-px w-16 bg-[var(--accent-yellow)] opacity-80" />
          </div>

          <h1
            className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-cream-light mb-4 animate-fade-in-up leading-tight"
            style={{ textShadow }}
            data-content-key={CONTENT_KEYS["hero.title"]}
          >
            {getText(overrides, CONTENT_KEYS["hero.title"], "Overflow of Jo")}
          </h1>

          {/* Yellow underline accent under title */}
          <div className="flex justify-center md:justify-start mb-6">
            <div className="h-1 w-24 rounded-full bg-[var(--accent-yellow)] opacity-85" />
          </div>

          <p
            className="font-display text-lg sm:text-xl font-semibold animate-fade-in-up animation-delay-100 max-w-2xl mx-auto md:mx-0 mb-3"
            style={{
              color: "var(--accent-yellow)",
              textShadow,
              letterSpacing: "0.04em",
            }}
            data-content-key={CONTENT_KEYS["hero.tagline"]}
          >
            {getText(
              overrides,
              CONTENT_KEYS["hero.tagline"],
              "Faith-Fueled Coffee",
            )}
          </p>
          <p
            className="font-body text-base sm:text-lg font-semibold text-cream-light mb-10 animate-fade-in-up animation-delay-200 max-w-xl mx-auto md:mx-0"
            style={{ textShadow }}
            data-content-key={CONTENT_KEYS["hero.location"]}
          >
            {getText(
              overrides,
              CONTENT_KEYS["hero.location"],
              "Inside Wave Wilson Church · Wilson, NC",
            )}
          </p>

          <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-4 justify-center md:justify-start animate-fade-in-up animation-delay-300">
            <button
              type="button"
              onClick={() => smoothScrollTo("events")}
              data-ocid="hero.primary_button"
              data-content-key={CONTENT_KEYS["hero.cta1"]}
              className="w-full sm:w-auto px-8 py-3 font-body font-semibold text-brown-dark rounded-sm transition-all duration-200 cursor-pointer"
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
              className="w-full sm:w-auto px-8 py-3 font-body font-semibold text-cream-light border-2 border-[var(--accent-yellow)] rounded-sm hover:bg-[var(--accent-yellow)]/20 hover:text-cream-light transition-all duration-200 cursor-pointer backdrop-blur-[2px]"
            >
              {getText(overrides, CONTENT_KEYS["hero.cta2"], "Our Mission")}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator — sits on the cream blend, so it reads dark. */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown className="w-6 h-6 text-brown-dark/70" />
      </div>

      {/* Seamless blend into the cream page body */}
      <div className="hero-bottom-fade" aria-hidden="true" />
    </section>
  );
}
