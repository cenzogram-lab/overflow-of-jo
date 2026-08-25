import { Coffee, Heart, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createActorWithConfig } from "../config";
import {
  CONTENT_KEYS,
  getText,
  useContentOverrides,
} from "../hooks/useContentOverrides";

const smoothScrollTo = (id: string) => {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const DEFAULT_ABOUT_IMG =
  "/assets/generated/about-illustration.dim_600x400.png";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [aboutImg, setAboutImg] = useState<string>(DEFAULT_ABOUT_IMG);
  const { overrides } = useContentOverrides();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    createActorWithConfig()
      .then((actor) => (actor as any).getAboutImageBase64())
      .then((result) => {
        if (result) setAboutImg(result);
      })
      .catch(() => {});
  }, []);

  const pillars = [
    {
      icon: Heart,
      titleKey: CONTENT_KEYS["about.pillar1.title"],
      titleDefault: "Faith First",
      descKey: CONTENT_KEYS["about.pillar1.desc"],
      descDefault:
        "Every cup is brewed with intention and prayer. We believe coffee can be a vessel for connection and spiritual nourishment.",
    },
    {
      icon: Coffee,
      titleKey: CONTENT_KEYS["about.pillar2.title"],
      titleDefault: "Craft & Quality",
      descKey: CONTENT_KEYS["about.pillar2.desc"],
      descDefault:
        "From bean to cup, we source ethically and brew carefully — because excellence in the small things reflects a greater calling.",
    },
    {
      icon: Users,
      titleKey: CONTENT_KEYS["about.pillar3.title"],
      titleDefault: "Community Rooted",
      descKey: CONTENT_KEYS["about.pillar3.desc"],
      descDefault:
        "Located inside Wave Wilson Church, we are a gathering place where neighbors become family over a shared love of great coffee.",
    },
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-20 md:py-28 bg-cream-light"
    >
      {/* Yellow accent divider at top */}
      <div className="accent-divider max-w-3xl mx-auto mb-12" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div
            className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p
              className="font-body text-sm font-semibold tracking-widest text-brown-light uppercase mb-3"
              data-content-key={CONTENT_KEYS["about.label"]}
            >
              {getText(overrides, CONTENT_KEYS["about.label"], "Our Story")}
            </p>
            <h2
              className="font-display text-4xl md:text-5xl font-bold text-brown-dark mb-2 leading-tight"
              data-content-key={CONTENT_KEYS["about.heading"]}
            >
              {getText(overrides, CONTENT_KEYS["about.heading"], "Our Mission")}
            </h2>
            {/* Yellow underline accent */}
            <div className="h-1 w-16 rounded-full bg-[var(--accent-yellow)] mb-6" />

            <p
              className="font-body text-base text-brown-mid leading-relaxed mb-6"
              data-content-key={CONTENT_KEYS["about.mission1"]}
            >
              {getText(
                overrides,
                CONTENT_KEYS["about.mission1"],
                "Overflow of Jo is a faith-inspired coffee shop located inside Wave Wilson Church in Wilson, NC. We exist to create a warm, welcoming space where the community can gather, connect, and be refreshed — body and soul.",
              )}
            </p>
            <p
              className="font-body text-base text-brown-mid leading-relaxed mb-8"
              data-content-key={CONTENT_KEYS["about.mission2"]}
            >
              {getText(
                overrides,
                CONTENT_KEYS["about.mission2"],
                "Our name reflects our belief that when we are filled with faith, love, and purpose, it naturally overflows into everything we do — including the coffee we serve.",
              )}
            </p>

            <button
              type="button"
              onClick={() => smoothScrollTo("events")}
              data-content-key={CONTENT_KEYS["about.cta"]}
              className="inline-flex items-center gap-2 px-6 py-3 font-body font-semibold text-brown-dark bg-[var(--accent-yellow)] border border-[var(--accent-yellow-border)] rounded-sm hover:bg-[var(--accent-yellow-hover)] hover:shadow-yellow-glow transition-all duration-200 cursor-pointer"
            >
              {getText(overrides, CONTENT_KEYS["about.cta"], "Join Us")}
              <span className="text-brown-mid">→</span>
            </button>
          </div>

          {/* Image */}
          <div
            className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="relative">
              <div className="absolute -inset-3 rounded-sm bg-[var(--accent-yellow)]/25 -z-10" />
              <img
                src={aboutImg}
                alt="Overflow of Jo coffee shop"
                className="w-full rounded-sm shadow-warm-lg object-cover"
              />
            </div>
          </div>
        </div>

        {/* Yellow accent divider */}
        <div className="accent-divider my-14" />

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const title = getText(
              overrides,
              pillar.titleKey,
              pillar.titleDefault,
            );
            return (
              <div
                key={pillar.titleKey}
                className={`text-center transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${(index + 2) * 150}ms` }}
              >
                <div className="w-14 h-14 rounded-full bg-[var(--accent-yellow)]/30 border-2 border-[var(--accent-yellow)] flex items-center justify-center mx-auto mb-4 shadow-warm-sm">
                  <Icon className="w-6 h-6 text-brown-dark" />
                </div>
                <h3
                  className="font-display text-xl font-semibold text-brown-dark mb-1"
                  data-content-key={pillar.titleKey}
                >
                  {title}
                </h3>
                <div className="h-0.5 w-8 rounded-full bg-[var(--accent-yellow)] mx-auto mb-3" />
                <p
                  className="font-body text-sm text-brown-mid leading-relaxed"
                  data-content-key={pillar.descKey}
                >
                  {getText(overrides, pillar.descKey, pillar.descDefault)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
