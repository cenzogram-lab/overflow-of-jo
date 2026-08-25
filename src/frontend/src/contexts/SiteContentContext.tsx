import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createActorWithConfig } from "../config";

// ─── Timing ───────────────────────────────────────────────────────────────────

/** Hard ceiling — the site is revealed even if the network never answers. */
const FAILSAFE_MS = 4500;
/** Minimum time the preloader stays up so it never flickers on a warm cache. */
const MIN_DISPLAY_MS = 1200;
/** Per-image ceiling while preloading critical artwork. */
const IMAGE_TIMEOUT_MS = 2200;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteContentValue {
  /** Admin-panel text overrides, keyed by CONTENT_KEYS. */
  overrides: Record<string, string>;
  /** Admin-supplied imagery — `null` means "use the bundled default". */
  heroImage: string | null;
  logoImage: string | null;
  aboutImage: string | null;
  /** Raw menu JSON from the backend, or `null` when unavailable. */
  menuJson: string | null;
  /** True once backend content and critical imagery settled (or the failsafe fired). */
  isReady: boolean;
  /** 0–100, drives the preloader progress bar. */
  progress: number;
  refetch: () => void;
}

const FALLBACK_VALUE: SiteContentValue = {
  overrides: {},
  heroImage: null,
  logoImage: null,
  aboutImage: null,
  menuJson: null,
  isReady: true,
  progress: 100,
  refetch: () => {},
};

export const SiteContentContext = createContext<SiteContentValue | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function settle<T>(run: () => Promise<T>): Promise<T | null> {
  try {
    return await run();
  } catch {
    return null;
  }
}

function nonEmpty(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function parseOverrides(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    // malformed JSON — fall back to bundled copy
  }
  return {};
}

/** Resolves as soon as the image is decoded, errors, or the timeout elapses. */
function preloadImage(src: string | null): Promise<void> {
  if (!src) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(done, IMAGE_TIMEOUT_MS);
    img.onload = done;
    img.onerror = done;
    img.src = src;
    if (img.decode) img.decode().then(done, done);
  });
}

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Fetches every piece of admin-managed content the public site needs — text
 * overrides, site imagery and the menu — in a single pass, preloads the
 * critical artwork, and only then reports `isReady`. Components read from here
 * instead of fetching individually, so the page never paints hardcoded
 * fallbacks that are moments later replaced by real content.
 */
export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [aboutImage, setAboutImage] = useState<string | null>(null);
  const [menuJson, setMenuJson] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(6);

  const mountedAt = useRef<number>(Date.now());
  const isMounted = useRef(true);
  const progressCap = useRef(22);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  /** Creeps the bar toward the current milestone so a slow network still moves. */
  useEffect(() => {
    if (isReady) return;
    const timer = window.setInterval(() => {
      setProgress((prev) =>
        prev >= progressCap.current
          ? prev
          : Math.min(
              prev + (progressCap.current - prev) * 0.14 + 0.4,
              progressCap.current,
            ),
      );
    }, 180);
    return () => window.clearInterval(timer);
  }, [isReady]);

  const advance = useCallback((cap: number) => {
    progressCap.current = cap;
    setProgress((prev) => Math.max(prev, Math.min(cap - 8, cap)));
  }, []);

  const reveal = useCallback(() => {
    if (!isMounted.current) return;
    const elapsed = Date.now() - mountedAt.current;
    const wait = Math.max(0, MIN_DISPLAY_MS - elapsed);
    window.setTimeout(() => {
      if (!isMounted.current) return;
      progressCap.current = 100;
      setProgress(100);
      setIsReady(true);
    }, wait);
  }, []);

  const load = useCallback(async () => {
    const actor = (await settle(() => createActorWithConfig())) as any;
    if (!isMounted.current) return;
    advance(38);

    if (!actor) {
      reveal();
      return;
    }

    const [rawOverrides, hero, logo, about, menu] = await Promise.all([
      settle<string>(() => actor.getContentOverrides()),
      settle<string>(() => actor.getHeroImageBase64()),
      settle<string>(() => actor.getLogoImageBase64()),
      settle<string>(() => actor.getAboutImageBase64()),
      settle<string>(() => actor.getMenuCategoriesJson()),
    ]);
    if (!isMounted.current) return;

    const resolvedHero = nonEmpty(hero);
    const resolvedLogo = nonEmpty(logo);
    const resolvedAbout = nonEmpty(about);

    setOverrides(parseOverrides(rawOverrides));
    setHeroImage(resolvedHero);
    setLogoImage(resolvedLogo);
    setAboutImage(resolvedAbout);
    setMenuJson(nonEmpty(menu));
    advance(76);

    // Warm the artwork that paints above the fold before lifting the veil.
    await Promise.all([
      preloadImage(
        resolvedHero ?? "/assets/generated/hero-bg.dim_1440x900.png",
      ),
      preloadImage(resolvedLogo),
      preloadImage(
        resolvedAbout ?? "/assets/generated/about-illustration.dim_600x400.png",
      ),
    ]);
    if (!isMounted.current) return;
    advance(96);
    reveal();
  }, [advance, reveal]);

  const refetch = useCallback(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  // Failsafe — never trap the visitor behind a hung request.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!isMounted.current) return;
      progressCap.current = 100;
      setProgress(100);
      setIsReady(true);
    }, FAILSAFE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo<SiteContentValue>(
    () => ({
      overrides,
      heroImage,
      logoImage,
      aboutImage,
      menuJson,
      isReady,
      progress,
      refetch,
    }),
    [
      overrides,
      heroImage,
      logoImage,
      aboutImage,
      menuJson,
      isReady,
      progress,
      refetch,
    ],
  );

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

// ─── Consumers ────────────────────────────────────────────────────────────────

/** Returns the provider value, or a resolved no-op value when unwrapped. */
export function useSiteContent(): SiteContentValue {
  return useContext(SiteContentContext) ?? FALLBACK_VALUE;
}
