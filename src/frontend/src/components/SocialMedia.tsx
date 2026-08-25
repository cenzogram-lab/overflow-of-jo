import React, { useState, useEffect, useRef, useCallback } from "react";
import { SiInstagram } from "react-icons/si";
import {
  CONTENT_KEYS,
  getText,
  useContentOverrides,
} from "../hooks/useContentOverrides";
import { getInstagramSlotsFromBackend } from "../utils/adminStorage";

// Augment the Window type so TS knows about Instagram's embed runtime.
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

const INSTAGRAM_EMBED_SCRIPT_SRC = "https://www.instagram.com/embed.js";
const SLOT_COUNT = 9;

/**
 * Loads Instagram's official embed script once per document. Resolves once the
 * script has been injected (or is already present). Safe to call repeatedly.
 */
function loadInstagramEmbedScript(): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${INSTAGRAM_EMBED_SCRIPT_SRC}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = INSTAGRAM_EMBED_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => resolve(); // don't block render on a failed CDN load
    document.body.appendChild(script);
  });
}

/**
 * Asks Instagram to transform any unprocessed blockquote.instagram-media nodes
 * into live embeds. Retries briefly because the embed script loads async.
 */
function processInstagramEmbeds() {
  if (window.instgrm?.Embeds?.process) {
    window.instgrm.Embeds.process();
    return;
  }
  // Script not ready yet — wait briefly and retry.
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (window.instgrm?.Embeds?.process) {
      window.instgrm.Embeds.process();
      window.clearInterval(timer);
    } else if (attempts > 10) {
      window.clearInterval(timer);
    }
  }, 300);
}

export default function SocialMedia() {
  const [slots, setSlots] = useState<(string | null)[]>(
    Array(SLOT_COUNT).fill(null),
  );
  const [loaded, setLoaded] = useState(false);
  const { overrides } = useContentOverrides();
  const gridRef = useRef<HTMLDivElement>(null);

  // Load the 9 Instagram post URLs from the backend.
  useEffect(() => {
    let cancelled = false;
    getInstagramSlotsFromBackend()
      .then((result) => {
        if (cancelled) return;
        const normalized: (string | null)[] = Array(SLOT_COUNT).fill(null);
        for (let i = 0; i < SLOT_COUNT && i < result.length; i++) {
          const entry = result[i];
          normalized[i] =
            typeof entry === "string" && entry.trim().length > 0
              ? entry.trim()
              : null;
        }
        setSlots(normalized);
      })
      .catch(() => {
        if (!cancelled) setSlots(Array(SLOT_COUNT).fill(null));
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-run Instagram's embed processor whenever the slot URLs change.
  const triggerEmbeds = useCallback(() => {
    loadInstagramEmbedScript().then(() => processInstagramEmbeds());
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (!slots.some((s) => s !== null)) return;
    triggerEmbeds();
  }, [slots, loaded, triggerEmbeds]);

  const handle = getText(
    overrides,
    CONTENT_KEYS["social.handle"],
    "@overflowofjo",
  );

  const populated = slots.filter((s) => s !== null).length;

  return (
    <section id="social" className="py-20 md:py-28 bg-cream-light">
      {/* Yellow accent divider at top */}
      <div className="accent-divider max-w-3xl mx-auto mb-12" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="font-body text-sm font-semibold tracking-widest text-brown-light uppercase mb-3"
            data-content-key={CONTENT_KEYS["social.label"]}
          >
            {getText(overrides, CONTENT_KEYS["social.label"], "Follow Along")}
          </p>
          <h2
            className="font-display text-4xl md:text-5xl font-bold text-brown-dark mb-2"
            data-content-key={CONTENT_KEYS["social.heading"]}
          >
            {getText(
              overrides,
              CONTENT_KEYS["social.heading"],
              "Find Us Online",
            )}
          </h2>
          {/* Yellow underline accent */}
          <div className="flex justify-center mb-4">
            <div className="h-1 w-16 rounded-full bg-[var(--accent-yellow)]" />
          </div>
          <p
            className="font-body text-brown-mid max-w-xl mx-auto"
            data-content-key={CONTENT_KEYS["social.desc"]}
          >
            {getText(
              overrides,
              CONTENT_KEYS["social.desc"],
              "Stay connected with our community, events, and daily inspiration.",
            )}
          </p>
        </div>

        {/* Handle Badge */}
        <div className="flex justify-center mb-10">
          <a
            href="https://www.instagram.com/overflowofjo/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit Instagram profile ${handle}`}
            data-ocid="social.handle_badge"
            data-content-key={CONTENT_KEYS["social.handle"]}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--accent-yellow)]/20 border border-[var(--accent-yellow)] font-body text-sm font-semibold text-brown-dark hover:bg-[var(--accent-yellow)]/40 transition-colors duration-200"
          >
            <SiInstagram className="w-4 h-4 text-brown-mid" />
            {handle}
          </a>
        </div>

        {/* Instagram Embed Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10 max-w-5xl mx-auto"
          data-ocid="social.embed_grid"
        >
          {slots.map((url, i) => {
            const slotNumber = i + 1;
            if (!url) return null;
            return (
              <div
                key={`ig-slot-${slotNumber}`}
                data-ocid={`social.embed.item.${slotNumber}`}
                className="flex justify-center"
              >
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink={url}
                  data-instgrm-version="14"
                  data-instgrm-captioned
                  data-instgrm-context="button"
                  style={{
                    background: "#FFF",
                    border: "0",
                    borderRadius: "3px",
                    boxShadow:
                      "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
                    margin: "1px",
                    maxWidth: "540px",
                    minWidth: "326px",
                    padding: "0",
                    width: "99.375%",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Empty state — no URLs configured yet */}
        {loaded && populated === 0 && (
          <div
            className="text-center py-12 mb-10 max-w-md mx-auto"
            data-ocid="social.empty_state"
          >
            <p className="font-body text-brown-mid">
              No Instagram posts linked yet. Add post URLs in the admin
              dashboard to feature them here.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <a
            href="https://www.instagram.com/overflowofjo/"
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="social.follow_button"
            className="inline-flex items-center gap-2 px-8 py-3 font-body font-semibold text-brown-dark bg-[var(--accent-yellow)] border border-[var(--accent-yellow-border)] rounded-sm hover:bg-[var(--accent-yellow-hover)] hover:shadow-yellow-glow transition-all duration-200"
          >
            <SiInstagram className="w-4 h-4" />
            Follow {handle}
          </a>
        </div>
      </div>
    </section>
  );
}
