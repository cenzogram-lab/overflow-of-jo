import { ArrowRight, BookOpen, Gift, Heart, Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  CONTENT_KEYS,
  getText,
  useContentOverrides,
} from "../hooks/useContentOverrides";
import { useSubmitPrayerRequest } from "../hooks/useQueries";

export default function PrayItForward() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    request: "",
    allowOnSleeve: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const { overrides } = useContentOverrides();

  const {
    mutate: submitPrayer,
    isPending,
    isError,
    error,
  } = useSubmitPrayerRequest();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPrayer(
      {
        firstName: formData.firstName,
        request: formData.request,
        allowOnSleeve: formData.allowOnSleeve,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setFormData({ firstName: "", request: "", allowOnSleeve: false });
        },
      },
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const sleeveFlow = [
    "Customers submit prayer requests",
    "Requests are written or printed on sleeves",
    "Sleeves go out randomly on cups",
    "The community prays for one another",
  ];

  const blessOptions = [
    "Leave cards on a board",
    "Barista hands to next guest",
    "Give to someone in need",
    "Use for first-time visitors",
  ];

  return (
    <section
      id="pray-it-forward"
      ref={sectionRef}
      className="py-20 md:py-28 bg-coffee-cream"
    >
      {/* Yellow accent divider at top */}
      <div className="accent-divider max-w-3xl mx-auto mb-12" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="font-body text-sm font-semibold tracking-widest text-brown-light uppercase mb-3">
            Give &amp; Receive
          </p>
          <h2
            className="font-display text-4xl md:text-5xl font-bold text-brown-dark mb-2"
            data-content-key={CONTENT_KEYS["pray.heading"]}
          >
            {getText(
              overrides,
              CONTENT_KEYS["pray.heading"],
              "Pray It Forward",
            )}
          </h2>
          <div className="flex justify-center mb-5">
            <div className="h-1 w-16 rounded-full bg-[var(--accent-yellow)]" />
          </div>
          <p
            className="font-body text-brown-mid text-lg max-w-xl mx-auto leading-relaxed"
            data-content-key={CONTENT_KEYS["pray.tagline"]}
          >
            {getText(
              overrides,
              CONTENT_KEYS["pray.tagline"],
              "Sip. Pray. Bless Someone.",
            )}
          </p>
          <p
            className="font-body text-brown-light text-sm max-w-2xl mx-auto mt-3 leading-relaxed"
            data-content-key={CONTENT_KEYS["pray.desc"]}
          >
            {getText(
              overrides,
              CONTENT_KEYS["pray.desc"],
              '"Pray It Forward" is both a giving program (gift cards) and a prayer-sharing experience (cup sleeves) — connecting coffee, generosity, and prayer in one beautiful act.',
            )}
          </p>
        </div>

        {/* ── Subsections 1 & 2 ── */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 mb-14">
          {/* Subsection 1: Bless Someone */}
          <div
            className={`transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="bg-cream-light rounded-sm p-8 shadow-warm border border-[var(--accent-yellow)]/30 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-yellow)]/30 border-2 border-[var(--accent-yellow)] flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-brown-dark" />
                </div>
                <h3
                  className="font-display text-2xl font-semibold text-brown-dark"
                  data-content-key={CONTENT_KEYS["pray.bless.title"]}
                >
                  {getText(
                    overrides,
                    CONTENT_KEYS["pray.bless.title"],
                    "Bless Someone",
                  )}
                </h3>
              </div>
              <div className="h-0.5 w-10 rounded-full bg-[var(--accent-yellow)] mb-5" />

              {/* Gift card copy */}
              <div className="bg-[var(--accent-yellow)]/10 border border-[var(--accent-yellow)]/30 rounded-sm p-4 mb-5">
                <p className="font-display text-base font-semibold text-brown-dark mb-1">
                  💛 Pray It Forward
                </p>
                <p
                  className="font-body text-sm text-brown-mid leading-relaxed"
                  data-content-key={CONTENT_KEYS["pray.bless.desc"]}
                >
                  {getText(
                    overrides,
                    CONTENT_KEYS["pray.bless.desc"],
                    "Want to bless someone today? Purchase a Pray It Forward card and we'll treat the next guest to a free drink — no questions asked.",
                  )}
                </p>
              </div>

              {/* Operational options */}
              <ul className="space-y-2.5 mt-auto">
                {blessOptions.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 font-body text-sm text-brown-mid"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-yellow)] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Subsection 2: Share a Prayer */}
          <div
            className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="bg-cream-light rounded-sm p-8 shadow-warm border border-[var(--accent-yellow)]/30 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-yellow)]/30 border-2 border-[var(--accent-yellow)] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-brown-dark" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-brown-dark">
                  Share a Prayer
                </h3>
              </div>
              <div className="h-0.5 w-10 rounded-full bg-[var(--accent-yellow)] mb-5" />

              {/* Flow steps */}
              <div className="space-y-2 mb-6">
                {sleeveFlow.map((step, i) => (
                  <div key={step} className="flex items-start gap-2">
                    <div className="flex flex-col items-center shrink-0 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--accent-yellow)]/30 border border-[var(--accent-yellow)] flex items-center justify-center text-[10px] font-bold text-brown-dark">
                        {i + 1}
                      </div>
                      {i < sleeveFlow.length - 1 && (
                        <div className="w-px h-4 bg-[var(--accent-yellow)]/40 mt-0.5" />
                      )}
                    </div>
                    <p className="font-body text-sm text-brown-mid leading-snug pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              {/* Sleeve concept cards */}
              <div className="grid grid-cols-2 gap-3 mt-auto">
                {/* Front of sleeve */}
                <div className="bg-[var(--accent-yellow)]/10 border border-[var(--accent-yellow)]/40 rounded-sm p-3">
                  <p className="font-body text-[10px] font-semibold text-brown-light uppercase tracking-wider mb-1.5">
                    Front of Sleeve
                  </p>
                  <p className="font-display text-sm font-semibold text-brown-dark leading-snug">
                    🙏 Pray It Forward
                  </p>
                  <p className="font-body text-xs text-brown-mid mt-1 leading-snug">
                    Someone in our community asked for prayer…
                  </p>
                </div>
                {/* Back of sleeve */}
                <div className="bg-[var(--accent-yellow)]/10 border border-[var(--accent-yellow)]/40 rounded-sm p-3">
                  <p className="font-body text-[10px] font-semibold text-brown-light uppercase tracking-wider mb-1.5">
                    Back of Sleeve
                  </p>
                  <p className="font-body text-xs text-brown-mid leading-snug">
                    Join us in praying for this request ❤️
                  </p>
                  <p className="font-body text-xs text-brown-light mt-1 leading-snug">
                    Submit yours below.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yellow accent divider */}
        <div className="accent-divider mb-14" />

        {/* ── Subsection 3: Submit a Prayer Request ── */}
        <div
          className={`max-w-xl mx-auto transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h3 className="font-display text-2xl font-semibold text-brown-dark mb-2 text-center">
            Submit a Prayer Request
          </h3>
          <div className="flex justify-center mb-4">
            <div className="h-0.5 w-10 rounded-full bg-[var(--accent-yellow)]" />
          </div>
          <p className="font-body text-sm text-brown-mid text-center mb-8 leading-relaxed">
            We believe prayer changes things. Share your prayer request below,
            and our community will be praying with you. Some requests may be
            anonymously featured on our coffee sleeves.
          </p>

          {submitted ? (
            <div className="text-center py-10 bg-[var(--accent-yellow)]/15 rounded-sm border border-[var(--accent-yellow-border)]">
              <div className="w-14 h-14 rounded-full bg-[var(--accent-yellow)]/40 border-2 border-[var(--accent-yellow)] flex items-center justify-center mx-auto mb-4">
                <Heart className="w-7 h-7 text-brown-dark" />
              </div>
              <h4 className="font-display text-xl font-semibold text-brown-dark mb-2">
                Prayer Received
              </h4>
              <p className="font-body text-brown-mid text-sm">
                Your request has been lifted up. We are praying with you.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-5 font-body text-xs text-brown-light underline hover:text-brown-mid transition-colors"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 bg-cream-light rounded-sm p-8 shadow-warm border border-[var(--accent-yellow)]/20"
            >
              {/* First Name */}
              <div>
                <label
                  htmlFor="prayer-first-name"
                  className="block font-body text-sm font-semibold text-brown-dark mb-1.5"
                  data-content-key={CONTENT_KEYS["pray.form.name"]}
                >
                  {getText(
                    overrides,
                    CONTENT_KEYS["pray.form.name"],
                    "First Name",
                  )}{" "}
                  <span className="font-normal text-brown-light">
                    (optional)
                  </span>
                </label>
                <input
                  id="prayer-first-name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Your first name"
                  className="w-full px-4 py-2.5 rounded-sm border border-cream-dark bg-cream-light font-body text-sm text-brown-dark placeholder:text-brown-light focus:outline-none focus:border-[var(--accent-yellow-border)] focus:ring-2 focus:ring-[var(--accent-yellow)]/30 transition-colors"
                />
              </div>

              {/* Prayer Request */}
              <div>
                <label
                  htmlFor="prayer-request"
                  className="block font-body text-sm font-semibold text-brown-dark mb-1.5"
                  data-content-key={CONTENT_KEYS["pray.form.request"]}
                >
                  {getText(
                    overrides,
                    CONTENT_KEYS["pray.form.request"],
                    "Prayer Request",
                  )}
                </label>
                <textarea
                  id="prayer-request"
                  name="request"
                  value={formData.request}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Share what's on your heart…"
                  className="w-full px-4 py-2.5 rounded-sm border border-cream-dark bg-cream-light font-body text-sm text-brown-dark placeholder:text-brown-light focus:outline-none focus:border-[var(--accent-yellow-border)] focus:ring-2 focus:ring-[var(--accent-yellow)]/30 transition-colors resize-none"
                />
              </div>

              {/* Checkbox */}
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="allowOnSleeve"
                  name="allowOnSleeve"
                  checked={formData.allowOnSleeve}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 rounded border-cream-dark accent-[var(--accent-yellow)] cursor-pointer shrink-0"
                />
                <label
                  htmlFor="allowOnSleeve"
                  className="font-body text-sm text-brown-mid cursor-pointer leading-snug"
                >
                  You may share this anonymously on cup sleeves
                </label>
              </div>

              {/* Error message */}
              {isError && (
                <p className="font-body text-xs text-red-600 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                  {error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."}
                </p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isPending}
                data-content-key={CONTENT_KEYS["pray.form.submit"]}
                className="w-full py-3 px-6 font-body font-semibold text-brown-dark bg-[var(--accent-yellow)] border border-[var(--accent-yellow-border)] rounded-sm hover:bg-[var(--accent-yellow-hover)] hover:shadow-yellow-glow transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    {getText(
                      overrides,
                      CONTENT_KEYS["pray.form.submit"],
                      "Submit Prayer",
                    )}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
