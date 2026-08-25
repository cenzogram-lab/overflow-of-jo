import { CheckCircle, Link2, Loader2, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  getInstagramSlotsFromBackend,
  removeInstagramSlotOnBackend,
  setInstagramSlotOnBackend,
} from "../../utils/adminStorage";
import MapAddressManagement from "./MapAddressManagement";

const SLOT_COUNT = 9;

/**
 * Accepts Instagram post / reel / TV URLs.
 * - with or without https:// or http://
 * - with or without trailing slash
 * - with or without query params (e.g. ?igsh=...)
 * Examples that pass:
 *   https://www.instagram.com/p/CxYz123/
 *   instagram.com/reel/CxYz123
 *   https://instagram.com/tv/CxYz123/?igsh=abc
 */
const INSTAGRAM_URL_RE =
  /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?(\?.*)?$/i;

function isValidInstagramUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return INSTAGRAM_URL_RE.test(trimmed);
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  // Ensure it has a protocol so the public site can render it safely.
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

interface SlotState {
  draft: string;
  saving: boolean;
  error: string;
  saved: boolean;
}

function emptySlot(): SlotState {
  return { draft: "", saving: false, error: "", saved: false };
}

export default function SocialGridManagement() {
  const [slots, setSlots] = useState<SlotState[]>(() =>
    Array.from({ length: SLOT_COUNT }, emptySlot),
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Load existing URLs on mount and pre-fill the 9 inputs.
  useEffect(() => {
    let cancelled = false;
    getInstagramSlotsFromBackend()
      .then((data) => {
        if (cancelled) return;
        const normalized = Array.from({ length: SLOT_COUNT }, (_, i) => {
          const url = data[i] ?? null;
          return {
            draft: url ?? "",
            saving: false,
            error: "",
            saved: false,
          } satisfies SlotState;
        });
        setSlots(normalized);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("Could not load saved Instagram URLs. Please reload.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSlot = (index: number, patch: Partial<SlotState>) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleDraftChange = (index: number, value: string) => {
    updateSlot(index, { draft: value, error: "" });
  };

  const handleSave = async (index: number) => {
    const draft = slots[index].draft.trim();

    // Empty draft => clear the slot.
    if (!draft) {
      updateSlot(index, { saving: true, error: "" });
      try {
        await removeInstagramSlotOnBackend(index);
        updateSlot(index, { saving: false, saved: true, draft: "" });
        window.setTimeout(() => updateSlot(index, { saved: false }), 2500);
      } catch {
        updateSlot(index, {
          saving: false,
          error: "Could not clear slot. Try again.",
        });
      }
      return;
    }

    if (!isValidInstagramUrl(draft)) {
      updateSlot(index, {
        error:
          "Enter a valid Instagram post URL (instagram.com/p/, /reel/, or /tv/).",
      });
      return;
    }

    updateSlot(index, { saving: true, error: "" });
    try {
      const normalized = normalizeUrl(draft);
      await setInstagramSlotOnBackend(index, normalized);
      updateSlot(index, {
        saving: false,
        saved: true,
        draft: normalized,
        error: "",
      });
      window.setTimeout(() => updateSlot(index, { saved: false }), 2500);
    } catch {
      updateSlot(index, {
        saving: false,
        error: "Save failed. Check your connection and try again.",
      });
    }
  };

  const handleClear = async (index: number) => {
    updateSlot(index, { saving: true, error: "" });
    try {
      await removeInstagramSlotOnBackend(index);
      updateSlot(index, { saving: false, saved: true, draft: "", error: "" });
      window.setTimeout(() => updateSlot(index, { saved: false }), 2500);
    } catch {
      updateSlot(index, {
        saving: false,
        error: "Could not clear slot. Try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin" />
        <span className="ml-3 text-admin-muted text-sm">
          Loading Instagram slots…
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-admin-text">
          Find Us Online Grid
        </h2>
        <p className="text-admin-muted text-sm mt-0.5">
          Paste an Instagram post, reel, or TV URL into each slot. The 3×3 grid
          below mirrors the public “Find Us Online” section. Empty slots show
          nothing on the live site.
        </p>
      </div>

      {loadError && (
        <div
          data-ocid="social_grid.error_state"
          className="mb-4 px-3 py-2 rounded border border-red-500/40 bg-red-500/10 text-red-300 text-sm"
        >
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map((slot, i) => {
          const slotNumber = i + 1;
          const hasUrl = slot.draft.trim().length > 0;
          return (
            <div
              key={`slot-${slotNumber}`}
              data-ocid={`social_grid.card.${slotNumber}`}
              className="bg-admin-card border border-admin-border rounded-lg overflow-hidden flex flex-col"
            >
              {/* Slot header / preview indicator */}
              <div className="px-3 py-2.5 border-b border-admin-border flex items-center justify-between">
                <span className="text-xs font-semibold text-admin-text">
                  Slot {slotNumber}
                </span>
                {hasUrl ? (
                  <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-admin-accent/15 text-admin-accent border border-admin-accent/30">
                    <Link2 className="w-3 h-3" />
                    URL set
                  </span>
                ) : (
                  <span className="text-[11px] text-admin-muted">Empty</span>
                )}
              </div>

              {/* URL paste field + actions */}
              <div className="p-3 flex flex-col gap-2 flex-1">
                <label htmlFor={`ig-slot-${slotNumber}`} className="sr-only">
                  Instagram post URL for slot {slotNumber}
                </label>
                <input
                  id={`ig-slot-${slotNumber}`}
                  data-ocid={`social_grid.input.${slotNumber}`}
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Paste Instagram post URL"
                  value={slot.draft}
                  onChange={(e) => handleDraftChange(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSave(i);
                    }
                  }}
                  disabled={slot.saving}
                  className="w-full min-w-0 px-2.5 py-2 text-sm bg-admin-input text-admin-text placeholder:text-admin-muted/70 border border-admin-border rounded focus:outline-none focus:border-admin-accent/60 focus:ring-1 focus:ring-admin-accent/40 disabled:opacity-60 transition-colors"
                />

                {/* Inline validation error */}
                {slot.error && (
                  <p
                    data-ocid={`social_grid.field_error.${slotNumber}`}
                    className="text-xs text-red-400 leading-snug"
                  >
                    {slot.error}
                  </p>
                )}

                {/* Saved confirmation */}
                {slot.saved && !slot.error && (
                  <p
                    data-ocid={`social_grid.success_state.${slotNumber}`}
                    className="flex items-center gap-1 text-xs text-green-400"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Saved
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                  <button
                    type="button"
                    data-ocid={`social_grid.save_button.${slotNumber}`}
                    onClick={() => handleSave(i)}
                    disabled={slot.saving}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-admin-accent text-admin-accent-text rounded hover:bg-admin-accent-hover disabled:opacity-50 transition-colors"
                  >
                    {slot.saving ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    {slot.saving ? "Saving…" : "Save"}
                  </button>

                  <button
                    type="button"
                    data-ocid={`social_grid.delete_button.${slotNumber}`}
                    onClick={() => handleClear(i)}
                    disabled={slot.saving || !hasUrl}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-admin-border text-admin-muted hover:text-red-300 hover:border-red-400/40 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-admin-muted leading-relaxed">
        Tip: open a post in Instagram, copy the URL from the browser address bar
        or the share menu, then paste it into a slot and press Save. Accepted
        paths: <code className="text-admin-text">/p/</code>,{" "}
        <code className="text-admin-text">/reel/</code>,{" "}
        <code className="text-admin-text">/tv/</code>.
      </p>

      {/* Map address editor subsection */}
      <div
        data-ocid="map_address.panel"
        className="mt-8 pt-6 border-t border-admin-border"
      >
        <MapAddressManagement />
      </div>
    </div>
  );
}
