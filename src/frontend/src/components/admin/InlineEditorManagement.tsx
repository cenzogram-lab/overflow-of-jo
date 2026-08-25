import {
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  RotateCcw,
  Save,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createActorWithConfig } from "../../config";

// ─── Default Content Values ──────────────────────────────────────────────────
// Copied from legacy ContentEditorManagement.tsx — used to determine which
// edits differ from defaults (only those are saved) and to reset on Discard.

const DEFAULTS: Record<string, string> = {
  // Hero
  "hero.title": "Overflow of Jo",
  "hero.tagline": "Faith-Fueled Coffee",
  "hero.location": "Inside Wave Wilson Church · Wilson, NC",
  "hero.cta1": "Explore Events",
  "hero.cta2": "Our Mission",

  // About
  "about.label": "Our Story",
  "about.heading": "Our Mission",
  "about.mission1":
    "Overflow of Jo is a faith-inspired coffee shop located inside Wave Wilson Church in Wilson, NC. We exist to create a warm, welcoming space where the community can gather, connect, and be refreshed — body and soul.",
  "about.mission2":
    "Our name reflects our belief that when we are filled with faith, love, and purpose, it naturally overflows into everything we do — including the coffee we serve.",
  "about.cta": "Join Us",
  "about.pillar1.title": "Faith First",
  "about.pillar1.desc":
    "Every cup is brewed with intention and prayer. We believe coffee can be a vessel for connection and spiritual nourishment.",
  "about.pillar2.title": "Craft & Quality",
  "about.pillar2.desc":
    "From bean to cup, we source ethically and brew carefully — because excellence in the small things reflects a greater calling.",
  "about.pillar3.title": "Community Rooted",
  "about.pillar3.desc":
    "Located inside Wave Wilson Church, we are a gathering place where neighbors become family over a shared love of great coffee.",

  // Events & Booking
  "events.heading": "Events & Booking",
  "events.subheading":
    "From Sunday coffee hours to private gatherings — we'd love to host your next event.",
  "events.form.name": "Your Name",
  "events.form.email": "Email Address",
  "events.form.phone": "Phone Number",
  "events.form.eventType": "Event Type",
  "events.form.date": "Event Date",
  "events.form.message": "Tell Us About Your Event",
  "events.form.submit": "Send Booking Inquiry",

  // Pray It Forward
  "pray.heading": "Pray It Forward",
  "pray.tagline": "Sip. Pray. Bless Someone.",
  "pray.desc":
    '"Pray It Forward" is both a giving program (gift cards) and a prayer-sharing experience (cup sleeves) — connecting coffee, generosity, and prayer in one beautiful act.',
  "pray.bless.title": "Bless Someone",
  "pray.bless.desc":
    "Want to bless someone today? Purchase a Pray It Forward card and we'll treat the next guest to a free drink — no questions asked.",
  "pray.form.name": "First Name",
  "pray.form.request": "Prayer Request",
  "pray.form.submit": "Submit Prayer",

  // Scripture & Community
  "scripture.heading": "Scripture & Community",
  "scripture.desc":
    "Rooted in faith, growing in community. A verse to carry with you today.",
  "scripture.verse1":
    '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."',
  "scripture.verse1.ref": "Jeremiah 29:11",
  "scripture.verse2": '"I can do all this through him who gives me strength."',
  "scripture.verse2.ref": "Philippians 4:13",
  "scripture.verse3":
    '"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."',
  "scripture.verse3.ref": "Proverbs 3:5-6",
  "scripture.verse4":
    '"Come to me, all you who are weary and burdened, and I will give you rest."',
  "scripture.verse4.ref": "Matthew 11:28",
  "scripture.verse5":
    '"Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go."',
  "scripture.verse5.ref": "Joshua 1:9",
  "scripture.verse6":
    '"And we know that in all things God works for the good of those who love him, who have been called according to his purpose."',
  "scripture.verse6.ref": "Romans 8:28",
  "scripture.community1.title": "Weekly Devotionals",
  "scripture.community1.desc":
    "Short reflections shared with our community every Monday morning.",
  "scripture.community2.title": "Prayer Wall",
  "scripture.community2.desc":
    "A physical board in our shop where you can post and receive prayer.",
  "scripture.community3.title": "Bible Study Nights",
  "scripture.community3.desc":
    "Monthly gatherings over coffee to explore scripture together.",

  // Social / Find Us Online
  "social.label": "Follow Along",
  "social.heading": "Find Us Online",
  "social.desc":
    "Stay connected with our community, events, and daily inspiration.",
  "social.handle": "@overflowofjo",

  // Footer
  "footer.desc":
    "A faith-inspired coffee shop inside Wave Wilson Church, Wilson, NC. Where community gathers and grace overflows.",
  "footer.contact.email": "hello@overflowofjo.com",
  "footer.contact.address":
    "Wave Wilson Church\n5334 Lamm Rd\nWilson, NC 27893",
  "footer.copyright": "© {year} Overflow of Jo. All rights reserved.",
};

const STYLE_TAG_ID = "inline-editor-edit-mode-style";

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InlineEditorManagement() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Edit Mode toggle — controls edit behavior for the embedded iframe only.
  const [editMode, setEditMode] = useState(false);

  // Pending edits: key -> edited text. useRef holds the live map (mutated by
  // input listeners inside the iframe); useState mirrors the count so the
  // toolbar re-renders.
  const pendingEditsRef = useRef<Record<string, string>>({});
  const [pendingCount, setPendingCount] = useState(0);

  // Saved overrides from the backend (key -> text).
  const [savedOverrides, setSavedOverrides] = useState<Record<string, string>>(
    {},
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle",
  );
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  // Track bound listeners so we can detach them when edit mode turns off.
  const boundListenersRef = useRef<
    Array<{ el: HTMLElement; type: string; fn: EventListener }>
  >([]);

  // ─── Load saved overrides from backend ───────────────────────────────────
  const loadOverrides = useCallback(() => {
    setLoading(true);
    createActorWithConfig()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((actor: any) => actor.getContentOverrides())
      .then((raw: string) => {
        let parsed: Record<string, string> = {};
        if (raw) {
          try {
            const p = JSON.parse(raw);
            if (p && typeof p === "object" && !Array.isArray(p)) {
              parsed = p as Record<string, string>;
            }
          } catch {
            // malformed JSON — use defaults
          }
        }
        setSavedOverrides(parsed);
      })
      .catch(() => {
        // backend unavailable — use defaults silently
        setSavedOverrides({});
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadOverrides();
  }, [loadOverrides]);

  // ─── Edit Mode injection ──────────────────────────────────────────────────

  const clearPendingEdits = useCallback(() => {
    pendingEditsRef.current = {};
    setPendingCount(0);
  }, []);

  const detachAllListeners = useCallback(() => {
    for (const { el, type, fn } of boundListenersRef.current) {
      el.removeEventListener(type, fn);
    }
    boundListenersRef.current = [];
  }, []);

  const injectEditMode = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let doc: Document | null = null;
    try {
      doc = iframe.contentDocument || iframe.contentWindow?.document || null;
    } catch {
      doc = null;
    }
    if (!doc) {
      setAccessError(
        "Could not access the site preview document (cross-origin block). Please reload the tab.",
      );
      return;
    }
    setAccessError(null);

    // 1. Inject the hover-outline style tag.
    if (!doc.getElementById(STYLE_TAG_ID)) {
      const style = doc.createElement("style");
      style.id = STYLE_TAG_ID;
      style.textContent =
        "[data-content-key]:hover { outline: 2px dashed #d4a017; outline-offset: 2px; cursor: text; }" +
        "[data-content-key]:focus { outline: 2px solid #b8860b; outline-offset: 2px; }";
      doc.head.appendChild(style);
    }

    // 2. For each editable element: enable contentEditable + bind listeners.
    const editableEls = doc.querySelectorAll<HTMLElement>("[data-content-key]");
    for (const el of editableEls) {
      el.setAttribute("contenteditable", "true");
      el.setAttribute("spellcheck", "false");

      const key = el.getAttribute("data-content-key") || "";

      // input listener — capture edited text into pending map.
      const onInput: EventListener = () => {
        const text = el.innerText ?? "";
        const current = pendingEditsRef.current[key] ?? "";
        if (text !== current) {
          pendingEditsRef.current[key] = text;
          setPendingCount(Object.keys(pendingEditsRef.current).length);
        }
      };

      // click listener — prevent navigation/onClick when in edit mode.
      const onClick: EventListener = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };

      // keydown listener — prevent Enter from creating divs in non-multiline.
      const onKeydown: EventListener = (e) => {
        const ev = e as KeyboardEvent;
        // Allow normal typing; block Enter on single-line elements to avoid
        // layout shifts (browser-native contentEditable may insert <div>).
        if (ev.key === "Enter") {
          // Allow Shift+Enter for multiline; otherwise consume.
          if (!ev.shiftKey) {
            ev.preventDefault();
          }
        }
      };

      el.addEventListener("input", onInput);
      el.addEventListener("click", onClick, true);
      el.addEventListener("keydown", onKeydown);
      boundListenersRef.current.push(
        { el, type: "input", fn: onInput },
        { el, type: "click", fn: onClick },
        { el, type: "keydown", fn: onKeydown },
      );
    }
  }, []);

  const removeEditMode = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let doc: Document | null = null;
    try {
      doc = iframe.contentDocument || iframe.contentWindow?.document || null;
    } catch {
      doc = null;
    }
    if (!doc) return;

    // Remove injected style tag.
    const style = doc.getElementById(STYLE_TAG_ID);
    if (style) style.remove();

    // Detach listeners + disable contentEditable.
    detachAllListeners();

    const editableEls = doc.querySelectorAll<HTMLElement>("[data-content-key]");
    for (const el of editableEls) {
      el.removeAttribute("contenteditable");
      el.removeAttribute("spellcheck");
    }
  }, [detachAllListeners]);

  // ─── Toggle Edit Mode ─────────────────────────────────────────────────────

  const toggleEditMode = useCallback(() => {
    if (editMode) {
      // Turning OFF: remove edit behavior + discard pending edits + reload iframe.
      removeEditMode();
      clearPendingEdits();
      setEditMode(false);
      // Reload iframe to get a clean, non-edited state.
      if (iframeRef.current) {
        iframeRef.current.src = "/";
      }
    } else {
      // Turning ON: enable iframe interaction + inject edit behavior.
      setEditMode(true);
      setSaveStatus("idle");
    }
  }, [editMode, removeEditMode, clearPendingEdits]);

  // When editMode flips ON, inject after iframe (re)loads.
  useEffect(() => {
    if (editMode && iframeLoaded) {
      injectEditMode();
    }
    // When editMode is OFF, ensure iframe is non-interactive.
    if (!editMode && iframeRef.current) {
      iframeRef.current.style.pointerEvents = "none";
    }
  }, [editMode, iframeLoaded, injectEditMode]);

  // ─── iframe load handler ──────────────────────────────────────────────────

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
    setAccessError(null);
    const iframe = iframeRef.current;
    if (!iframe) return;
    // Default: non-interactive preview. Edit mode flips this on.
    iframe.style.pointerEvents = editMode ? "auto" : "none";
    if (editMode) {
      // Re-inject on every reload while edit mode is on.
      injectEditMode();
    }
  }, [editMode, injectEditMode]);

  // ─── Save ──────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      // Merge pending edits with existing saved overrides. Only include keys
      // whose edited value DIFFERS from the hardcoded default.
      const merged: Record<string, string> = { ...savedOverrides };
      for (const [key, value] of Object.entries(pendingEditsRef.current)) {
        if (value !== DEFAULTS[key]) {
          merged[key] = value;
        } else {
          // If the edited value matches the default, drop the override.
          delete merged[key];
        }
      }
      const actor = await createActorWithConfig();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).saveContentOverrides(JSON.stringify(merged));
      setSavedOverrides(merged);
      clearPendingEdits();
      setSaveStatus("saved");
      // Reload iframe to reflect saved state cleanly.
      if (iframeRef.current) {
        iframeRef.current.src = "/";
      }
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }, [savedOverrides, clearPendingEdits]);

  // ─── Discard ───────────────────────────────────────────────────────────────

  const handleDiscard = useCallback(() => {
    clearPendingEdits();
    setSaveStatus("idle");
    // Reload iframe to revert all edited elements to last-saved/default text.
    if (iframeRef.current) {
      iframeRef.current.src = "/";
    }
  }, [clearPendingEdits]);

  // ─── Reload preview ────────────────────────────────────────────────────────

  const handleReloadPreview = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = "/";
    }
  }, []);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      detachAllListeners();
    };
  }, [detachAllListeners]);

  const hasPending = pendingCount > 0;

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin" />
        <span className="ml-3 text-admin-muted text-sm">Loading content…</span>
      </div>
    );
  }

  return (
    <div data-ocid="inline-editor.panel" className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-admin-text">Inline Editor</h2>
          <p className="text-admin-muted text-sm mt-0.5">
            Toggle Edit Mode, then click any text in the live preview to edit it
            inline. Save commits your changes to the backend.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div
        data-ocid="inline-editor.toolbar"
        className="flex flex-wrap items-center gap-3 px-4 py-3 bg-admin-card border border-admin-border rounded-lg"
      >
        {/* Edit Mode toggle (switch-style) */}
        <div className="flex items-center gap-2.5">
          <Zap
            className={`w-4 h-4 transition-colors ${
              editMode ? "text-admin-accent" : "text-admin-muted"
            }`}
          />
          <span className="text-sm font-medium text-admin-text">
            Edit Mode:
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={editMode}
            data-ocid="inline-editor.toggle"
            onClick={toggleEditMode}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-admin-accent/60 ${
              editMode
                ? "bg-admin-accent border-admin-accent-hover"
                : "bg-admin-input border-admin-border"
            }`}
            aria-label={editMode ? "Turn Edit Mode off" : "Turn Edit Mode on"}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                editMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm font-semibold ${
              editMode ? "text-admin-accent" : "text-admin-muted"
            }`}
          >
            {editMode ? "On" : "Off"}
          </span>
        </div>

        <div className="h-6 w-px bg-admin-border hidden sm:block" />

        {/* Pending edits indicator */}
        {hasPending ? (
          <span
            data-ocid="inline-editor.loading_state"
            className="flex items-center gap-1.5 text-xs text-admin-accent font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-admin-accent inline-block" />
            {pendingCount} pending edit{pendingCount !== 1 ? "s" : ""}
          </span>
        ) : (
          <span className="text-xs text-admin-muted italic">
            No pending edits
          </span>
        )}

        {/* Save / Discard */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            data-ocid="inline-editor.save_button"
            onClick={handleSave}
            disabled={saving || !hasPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-admin-accent text-admin-accent-text text-sm font-semibold rounded-md hover:bg-admin-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-admin-accent-text/30 border-t-admin-accent-text rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </button>

          <button
            type="button"
            data-ocid="inline-editor.discard_button"
            onClick={handleDiscard}
            disabled={saving || !hasPending}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-admin-muted hover:text-admin-text border border-admin-border hover:border-admin-accent/50 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Discard
          </button>

          <button
            type="button"
            data-ocid="inline-editor.reload_button"
            onClick={handleReloadPreview}
            title="Reload preview"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-admin-muted hover:text-admin-text border border-admin-border hover:border-admin-accent/50 rounded-md transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reload</span>
          </button>
        </div>

        {/* Status messages */}
        {saveStatus === "saved" && !saving && (
          <span
            data-ocid="inline-editor.success_state"
            className="w-full sm:w-auto sm:ml-2 text-xs text-green-400 flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            All changes saved
          </span>
        )}
        {saveStatus === "error" && (
          <span
            data-ocid="inline-editor.error_state"
            className="w-full sm:w-auto sm:ml-2 text-xs text-red-400 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Save failed. Try again.
          </span>
        )}
      </div>

      {/* iframe preview */}
      <div
        data-ocid="inline-editor.iframe_container"
        className="relative rounded-lg overflow-hidden border border-admin-border bg-admin-bg"
        style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}
      >
        {/* Browser chrome bar */}
        <div className="absolute top-0 left-0 right-0 z-10 px-3 py-1.5 bg-admin-card border-b border-admin-border flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-admin-accent/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[10px] text-admin-muted font-mono truncate">
            / — public site {editMode ? "(edit mode)" : "(preview)"}
          </span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-admin-muted">
            {editMode ? (
              <>
                <Eye className="w-3 h-3 text-admin-accent" />
                <span className="text-admin-accent">Editing</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                <span>Read-only</span>
              </>
            )}
          </span>
        </div>

        <iframe
          ref={iframeRef}
          src="/"
          title="Live site inline editor"
          data-ocid="inline-editor.iframe"
          className="w-full h-full"
          style={{
            marginTop: "32px",
            height: "calc(100% - 32px)",
            pointerEvents: editMode ? "auto" : "none",
            border: "none",
          }}
          onLoad={handleIframeLoad}
        />

        {accessError && (
          <div
            data-ocid="inline-editor.error_state"
            className="absolute inset-0 top-8 flex items-center justify-center bg-admin-bg/95 p-6"
          >
            <div className="max-w-md text-center">
              <X className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-admin-text text-sm font-medium mb-1">
                Preview access failed
              </p>
              <p className="text-admin-muted text-xs">{accessError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="text-[11px] text-admin-muted/70 text-center">
        {editMode
          ? "Click any text in the preview to edit it inline. Edits are held as pending until you Save or Discard."
          : "Toggle Edit Mode on, then click any text in the preview to edit it."}
      </p>
    </div>
  );
}
