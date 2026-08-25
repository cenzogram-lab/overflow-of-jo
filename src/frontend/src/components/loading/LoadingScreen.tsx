import { useEffect, useRef, useState } from "react";
import BrewingCup from "./BrewingCup";
import FoodTruck from "./FoodTruck";
import { dismissBootSplash } from "./bootSplash";
import "./loading-screen.css";

/** Must match --brew-exit in loading-screen.css. */
const EXIT_MS = 520;
/**
 * Ceiling on the wait for the truck to park. The exit normally starts on the
 * truck's own transitionend, so this only covers the cases where no transition
 * runs at all (reduced motion, or the truck already at the end of its track).
 */
const PARK_MAX_MS = 760;

/** Progress values where the animation changes act. */
const BREW_AT = 40;
const OVERFLOW_AT = 80;

/**
 * Where the truck sits on its track, 0 (far left) to 1 (parked far right).
 *
 * Front-loaded on purpose: it covers most of the road while the cup is still
 * filling, then closes the last stretch as the coffee reaches the brim, so
 * arriving and overflowing land together.
 */
function truckPosition(p: number): number {
  if (p <= 0.4) return (p / 0.4) * 0.55;
  if (p <= 0.8) return 0.55 + ((p - 0.4) / 0.4) * 0.37;
  return 0.92 + ((p - 0.8) / 0.2) * 0.08;
}

/** Liquid offset in SVG units: 104 is an empty cup, 0 the brim, -6 overflowing. */
function liquidOffset(p: number): number {
  if (p <= 0.8) return 104 - (p / 0.8) * 104;
  return -((p - 0.8) / 0.2) * 6;
}

export interface LoadingScreenProps {
  /** While true the overlay covers the page. Flip to false to play the exit. */
  active: boolean;
  /** 0–100. Drives the truck, the liquid level and the spill. */
  progress: number;
  /** Copy under the mark. */
  message?: string;
}

/**
 * Full-screen brewing preloader. Stays mounted and opaque from first paint,
 * fades + scales away when `active` goes false, then unmounts entirely so it
 * can never intercept a click.
 *
 * Every moving part is a function of `progress` rather than of wall-clock
 * time, so the truck's journey and the cup filling always line up with what
 * the loader is actually waiting on.
 */
export default function LoadingScreen({
  active,
  progress,
  message = "Brewing your experience",
}: LoadingScreenProps) {
  const [isMounted, setIsMounted] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isParked, setIsParked] = useState(false);
  const truckRef = useRef<HTMLDivElement>(null);

  // Hand off from the static boot splash in index.html.
  useEffect(() => {
    dismissBootSplash();
  }, []);

  // Park first, exit second: the truck is sent to the end of its track, and
  // the fade only starts once it has actually got there. Waiting on the real
  // transitionend rather than a guessed delay means the arrival is never cut
  // off, however long the last move happens to be.
  useEffect(() => {
    if (active) {
      setIsMounted(true);
      setIsExiting(false);
      setIsParked(false);
      return;
    }
    setIsParked(true);

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      setIsExiting(true);
    };

    // Reduced motion runs no transition, so nothing would ever fire.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    const node = truckRef.current;
    const onEnd = (event: TransitionEvent) => {
      if (event.propertyName === "transform") finish();
    };
    node?.addEventListener("transitionend", onEnd);
    const cap = window.setTimeout(finish, PARK_MAX_MS);

    return () => {
      node?.removeEventListener("transitionend", onEnd);
      window.clearTimeout(cap);
    };
  }, [active]);

  useEffect(() => {
    if (!isExiting) return;
    const timer = window.setTimeout(() => setIsMounted(false), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [isExiting]);

  // Don't let the veiled page scroll behind the overlay.
  useEffect(() => {
    if (!isMounted) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMounted]);

  if (!isMounted) return null;

  const shown = isParked ? 100 : Math.max(0, Math.min(100, progress));
  const p = shown / 100;
  const phase =
    shown < BREW_AT ? "roll" : shown < OVERFLOW_AT ? "brew" : "overflow";

  // Custom properties are passed as strings so React hands them to
  // setProperty untouched.
  const vars = {
    "--brew-truck-x": truckPosition(p).toFixed(4),
    "--brew-liquid-y": `${liquidOffset(p).toFixed(2)}px`,
    "--brew-spill": Math.min(1, Math.max(0, (p - 0.8) / 0.2)).toFixed(4),
  } as React.CSSProperties;

  return (
    <output
      className={`brew-loader${isExiting ? " brew-loader--exiting" : ""}${
        isParked ? " brew-loader--parked" : ""
      }`}
      data-phase={phase}
      style={vars}
      aria-live="polite"
      aria-busy={active}
      data-testid="loading-screen"
    >
      <div className="brew-loader__inner">
        <BrewingCup />

        <div className="brew-loader__wordmark">
          <p className="brew-loader__name">Overflow</p>
          <p className="brew-loader__sub">of Jo</p>
        </div>

        <p className="brew-loader__status">
          {message}
          <span className="brew-loader__dot">.</span>
          <span className="brew-loader__dot">.</span>
          <span className="brew-loader__dot">.</span>
        </p>
      </div>

      {/* The truck is the progress indicator: how far along the road it has
          got is how far along the load is. Decorative to assistive tech — the
          live-region message above carries the semantics. */}
      <div className="brew-track" aria-hidden="true">
        <div className="brew-track__road" />
        <div className="brew-track__trail" />
        <div className="brew-track__truck" ref={truckRef}>
          <FoodTruck />
        </div>
      </div>
    </output>
  );
}
