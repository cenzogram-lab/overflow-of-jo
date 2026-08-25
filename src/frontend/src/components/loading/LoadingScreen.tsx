import { useEffect, useState } from "react";
import BrewingCup from "./BrewingCup";
import { dismissBootSplash } from "./bootSplash";
import "./loading-screen.css";

/** Must match --brew-exit in loading-screen.css. */
const EXIT_MS = 520;

export interface LoadingScreenProps {
  /** While true the overlay covers the page. Flip to false to play the exit. */
  active: boolean;
  /** 0–100. */
  progress: number;
  /** Copy under the mark. */
  message?: string;
}

/**
 * Full-screen brewing preloader. Stays mounted and opaque from first paint,
 * fades + scales away when `active` goes false, then unmounts entirely so it
 * can never intercept a click.
 */
export default function LoadingScreen({
  active,
  progress,
  message = "Brewing your experience",
}: LoadingScreenProps) {
  const [isMounted, setIsMounted] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Hand off from the static boot splash in index.html.
  useEffect(() => {
    dismissBootSplash();
  }, []);

  useEffect(() => {
    if (active) {
      setIsMounted(true);
      setIsExiting(false);
      return;
    }
    setIsExiting(true);
    const timer = window.setTimeout(() => setIsMounted(false), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [active]);

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

  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <output
      className={`brew-loader${isExiting ? " brew-loader--exiting" : ""}`}
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

        {/* Decorative — the live-region message above carries the semantics. */}
        <div className="brew-loader__progress" aria-hidden="true">
          <div
            className="brew-loader__progress-fill"
            style={{ transform: `scaleX(${clamped / 100})` }}
          />
          <div className="brew-loader__progress-shine" />
        </div>

        <p className="brew-loader__status">
          {message}
          <span className="brew-loader__dot">.</span>
          <span className="brew-loader__dot">.</span>
          <span className="brew-loader__dot">.</span>
        </p>
      </div>
    </output>
  );
}
