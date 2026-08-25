import { useCallback, useContext, useEffect, useState } from "react";
import { createActorWithConfig } from "../config";
import { SiteContentContext } from "../contexts/SiteContentContext";

// ─── Content Key Constants ────────────────────────────────────────────────────

export const CONTENT_KEYS = {
  // Hero
  "hero.title": "hero.title",
  "hero.tagline": "hero.tagline",
  "hero.location": "hero.location",
  "hero.cta1": "hero.cta1",
  "hero.cta2": "hero.cta2",

  // About
  "about.label": "about.label",
  "about.heading": "about.heading",
  "about.mission1": "about.mission1",
  "about.mission2": "about.mission2",
  "about.cta": "about.cta",
  "about.pillar1.title": "about.pillar1.title",
  "about.pillar1.desc": "about.pillar1.desc",
  "about.pillar2.title": "about.pillar2.title",
  "about.pillar2.desc": "about.pillar2.desc",
  "about.pillar3.title": "about.pillar3.title",
  "about.pillar3.desc": "about.pillar3.desc",

  // Events & Booking
  "events.heading": "events.heading",
  "events.subheading": "events.subheading",
  "events.form.name": "events.form.name",
  "events.form.email": "events.form.email",
  "events.form.phone": "events.form.phone",
  "events.form.eventType": "events.form.eventType",
  "events.form.date": "events.form.date",
  "events.form.message": "events.form.message",
  "events.form.submit": "events.form.submit",

  // Pray It Forward
  "pray.heading": "pray.heading",
  "pray.tagline": "pray.tagline",
  "pray.desc": "pray.desc",
  "pray.bless.title": "pray.bless.title",
  "pray.bless.desc": "pray.bless.desc",
  "pray.form.name": "pray.form.name",
  "pray.form.request": "pray.form.request",
  "pray.form.submit": "pray.form.submit",

  // Scripture & Community
  "scripture.heading": "scripture.heading",
  "scripture.desc": "scripture.desc",
  "scripture.verse1": "scripture.verse1",
  "scripture.verse1.ref": "scripture.verse1.ref",
  "scripture.verse2": "scripture.verse2",
  "scripture.verse2.ref": "scripture.verse2.ref",
  "scripture.verse3": "scripture.verse3",
  "scripture.verse3.ref": "scripture.verse3.ref",
  "scripture.verse4": "scripture.verse4",
  "scripture.verse4.ref": "scripture.verse4.ref",
  "scripture.verse5": "scripture.verse5",
  "scripture.verse5.ref": "scripture.verse5.ref",
  "scripture.verse6": "scripture.verse6",
  "scripture.verse6.ref": "scripture.verse6.ref",
  "scripture.community1.title": "scripture.community1.title",
  "scripture.community1.desc": "scripture.community1.desc",
  "scripture.community2.title": "scripture.community2.title",
  "scripture.community2.desc": "scripture.community2.desc",
  "scripture.community3.title": "scripture.community3.title",
  "scripture.community3.desc": "scripture.community3.desc",

  // Social / Find Us Online
  "social.label": "social.label",
  "social.heading": "social.heading",
  "social.desc": "social.desc",
  "social.handle": "social.handle",

  // Footer
  "footer.desc": "footer.desc",
  "footer.contact.email": "footer.contact.email",
  "footer.contact.address": "footer.contact.address",
  "footer.copyright": "footer.copyright",
} as const;

export type ContentKey = (typeof CONTENT_KEYS)[keyof typeof CONTENT_KEYS];

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Returns overrides[key] if it exists and is non-empty, otherwise defaultText.
 */
export function getText(
  overrides: Record<string, string>,
  key: string,
  defaultText: string,
): string {
  const value = overrides[key];
  return value && value.trim().length > 0 ? value : defaultText;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Standalone fetch, used only when the hook is called outside
 * `SiteContentProvider` (the admin surface). Inside the provider the shared,
 * already-resolved copy is returned instead so the page makes one request and
 * never re-renders text underneath the visitor.
 */
function useStandaloneOverrides(enabled: boolean): {
  overrides: Record<string, string>;
  loading: boolean;
  refetch: () => void;
} {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(enabled);

  const fetchOverrides = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    createActorWithConfig()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((actor: any) => actor.getContentOverrides())
      .then((raw: string) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (
              parsed &&
              typeof parsed === "object" &&
              !Array.isArray(parsed)
            ) {
              setOverrides(parsed as Record<string, string>);
            }
          } catch {
            // malformed JSON — use defaults
          }
        }
      })
      .catch(() => {
        // backend unavailable — use defaults silently
      })
      .finally(() => {
        setLoading(false);
      });
  }, [enabled]);

  useEffect(() => {
    fetchOverrides();
  }, [fetchOverrides]);

  return { overrides, loading, refetch: fetchOverrides };
}

export function useContentOverrides(): {
  overrides: Record<string, string>;
  loading: boolean;
  refetch: () => void;
} {
  const site = useContext(SiteContentContext);
  const standalone = useStandaloneOverrides(site === null);

  if (site) {
    return {
      overrides: site.overrides,
      loading: !site.isReady,
      refetch: site.refetch,
    };
  }
  return standalone;
}
