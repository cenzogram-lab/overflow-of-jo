import {
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  RefreshCw,
  RotateCcw,
  Save,
  X,
  Zap,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { createActorWithConfig } from "../../config";

// ─── Default Content Values ──────────────────────────────────────────────────

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

// ─── Section Definitions ─────────────────────────────────────────────────────

interface FieldDef {
  key: string;
  label: string;
  multiline?: boolean;
}

interface SectionDef {
  id: string;
  title: string;
  fields: FieldDef[];
}

const SECTIONS: SectionDef[] = [
  {
    id: "hero",
    title: "Hero",
    fields: [
      { key: "hero.title", label: "Title" },
      { key: "hero.tagline", label: "Tagline" },
      { key: "hero.location", label: "Location" },
      { key: "hero.cta1", label: "Button 1 Text" },
      { key: "hero.cta2", label: "Button 2 Text" },
    ],
  },
  {
    id: "about",
    title: "About / Our Mission",
    fields: [
      { key: "about.label", label: "Section Label" },
      { key: "about.heading", label: "Heading" },
      { key: "about.mission1", label: "Mission Paragraph 1", multiline: true },
      { key: "about.mission2", label: "Mission Paragraph 2", multiline: true },
      { key: "about.cta", label: "CTA Button Text" },
      { key: "about.pillar1.title", label: "Pillar 1 Title" },
      {
        key: "about.pillar1.desc",
        label: "Pillar 1 Description",
        multiline: true,
      },
      { key: "about.pillar2.title", label: "Pillar 2 Title" },
      {
        key: "about.pillar2.desc",
        label: "Pillar 2 Description",
        multiline: true,
      },
      { key: "about.pillar3.title", label: "Pillar 3 Title" },
      {
        key: "about.pillar3.desc",
        label: "Pillar 3 Description",
        multiline: true,
      },
    ],
  },
  {
    id: "events",
    title: "Events & Booking",
    fields: [
      { key: "events.heading", label: "Section Heading" },
      { key: "events.subheading", label: "Subheading", multiline: true },
      { key: "events.form.name", label: "Form: Name Label" },
      { key: "events.form.email", label: "Form: Email Label" },
      { key: "events.form.phone", label: "Form: Phone Label" },
      { key: "events.form.eventType", label: "Form: Event Type Label" },
      { key: "events.form.date", label: "Form: Date Label" },
      { key: "events.form.message", label: "Form: Message Label" },
      { key: "events.form.submit", label: "Form: Submit Button" },
    ],
  },
  {
    id: "pray",
    title: "Pray It Forward",
    fields: [
      { key: "pray.heading", label: "Section Heading" },
      { key: "pray.tagline", label: "Tagline" },
      { key: "pray.desc", label: "Description", multiline: true },
      { key: "pray.bless.title", label: "Bless Someone Title" },
      {
        key: "pray.bless.desc",
        label: "Bless Someone Description",
        multiline: true,
      },
      { key: "pray.form.name", label: "Form: Name Label" },
      { key: "pray.form.request", label: "Form: Request Label" },
      { key: "pray.form.submit", label: "Form: Submit Button" },
    ],
  },
  {
    id: "scripture",
    title: "Scripture & Community",
    fields: [
      { key: "scripture.heading", label: "Section Heading" },
      { key: "scripture.desc", label: "Description", multiline: true },
      { key: "scripture.verse1", label: "Verse 1 Text", multiline: true },
      { key: "scripture.verse1.ref", label: "Verse 1 Reference" },
      { key: "scripture.verse2", label: "Verse 2 Text", multiline: true },
      { key: "scripture.verse2.ref", label: "Verse 2 Reference" },
      { key: "scripture.verse3", label: "Verse 3 Text", multiline: true },
      { key: "scripture.verse3.ref", label: "Verse 3 Reference" },
      { key: "scripture.verse4", label: "Verse 4 Text", multiline: true },
      { key: "scripture.verse4.ref", label: "Verse 4 Reference" },
      { key: "scripture.verse5", label: "Verse 5 Text", multiline: true },
      { key: "scripture.verse5.ref", label: "Verse 5 Reference" },
      { key: "scripture.verse6", label: "Verse 6 Text", multiline: true },
      { key: "scripture.verse6.ref", label: "Verse 6 Reference" },
      { key: "scripture.community1.title", label: "Community Feature 1 Title" },
      {
        key: "scripture.community1.desc",
        label: "Community Feature 1 Description",
        multiline: true,
      },
      { key: "scripture.community2.title", label: "Community Feature 2 Title" },
      {
        key: "scripture.community2.desc",
        label: "Community Feature 2 Description",
        multiline: true,
      },
      { key: "scripture.community3.title", label: "Community Feature 3 Title" },
      {
        key: "scripture.community3.desc",
        label: "Community Feature 3 Description",
        multiline: true,
      },
    ],
  },
  {
    id: "social",
    title: "Find Us Online",
    fields: [
      { key: "social.label", label: "Section Label" },
      { key: "social.heading", label: "Section Heading" },
      { key: "social.desc", label: "Description", multiline: true },
      { key: "social.handle", label: "Instagram Handle" },
    ],
  },
  {
    id: "footer",
    title: "Footer",
    fields: [
      { key: "footer.desc", label: "Brand Description", multiline: true },
      { key: "footer.contact.email", label: "Contact Email" },
      {
        key: "footer.contact.address",
        label: "Contact Address",
        multiline: true,
      },
      { key: "footer.copyright", label: "Copyright Text" },
    ],
  },
];

// ─── Collapsible Section ─────────────────────────────────────────────────────

interface SectionPanelProps {
  section: SectionDef;
  current: Record<string, string>;
  saved: Record<string, string>;
  editMode: boolean;
  onChange: (key: string, value: string) => void;
}

function SectionPanel({
  section,
  current,
  saved,
  editMode,
  onChange,
}: SectionPanelProps) {
  const [open, setOpen] = useState(false);

  const hasUnsaved = section.fields.some(
    (f) => current[f.key] !== (saved[f.key] ?? ""),
  );
  const displayCount = open ? section.fields.length : 0;
  void displayCount;

  return (
    <div className="border border-admin-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
          open ? "bg-admin-input" : "bg-admin-card hover:bg-admin-input"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {open ? (
            <ChevronDown className="w-4 h-4 text-admin-muted flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-admin-muted flex-shrink-0" />
          )}
          <span className="text-sm font-semibold text-admin-text truncate">
            {section.title}
          </span>
          {hasUnsaved && editMode && (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#E8C84A]/20 text-[#E8C84A] border border-[#E8C84A]/30 flex-shrink-0">
              edited
            </span>
          )}
        </div>
        <span className="text-xs text-admin-muted flex-shrink-0 ml-2">
          {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
        </span>
      </button>

      {open && (
        <div className="px-4 py-4 space-y-4 bg-admin-bg border-t border-admin-border">
          {section.fields.map((field) => (
            <FieldEditor
              key={field.key}
              field={field}
              value={current[field.key] ?? ""}
              savedValue={saved[field.key] ?? ""}
              editMode={editMode}
              onChange={(v) => onChange(field.key, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Field Editor ─────────────────────────────────────────────────────────────

interface FieldEditorProps {
  field: FieldDef;
  value: string;
  savedValue: string;
  editMode: boolean;
  onChange: (value: string) => void;
}

function FieldEditor({
  field,
  value,
  savedValue,
  editMode,
  onChange,
}: FieldEditorProps) {
  const isEmpty = editMode && value.trim().length === 0;
  const isModified = value !== savedValue;

  const baseInputClass =
    "w-full px-3 py-2 bg-admin-input border rounded-md text-admin-text text-sm placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-[#E8C84A]/60 focus:border-[#E8C84A]/70 transition-colors resize-none";
  const borderClass = isEmpty
    ? "border-red-500/60"
    : isModified
      ? "border-[#E8C84A]/50"
      : "border-admin-border";

  const displayValue = value || DEFAULTS[field.key] || "";
  const fieldId = `content-field-${field.key.replaceAll(".", "-")}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label
          htmlFor={editMode ? fieldId : undefined}
          className="block text-xs font-medium text-admin-muted"
        >
          {field.label}
          {isModified && editMode && (
            <span className="ml-1.5 text-[#E8C84A] font-semibold">•</span>
          )}
        </label>
        <span className="text-[10px] text-admin-muted/60">
          {displayValue.length} chars
        </span>
      </div>

      {editMode ? (
        field.multiline ? (
          <textarea
            id={fieldId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className={`${baseInputClass} ${borderClass}`}
            placeholder={DEFAULTS[field.key] || "Enter text..."}
          />
        ) : (
          <input
            id={fieldId}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseInputClass} ${borderClass}`}
            placeholder={DEFAULTS[field.key] || "Enter text..."}
          />
        )
      ) : (
        <div className="px-3 py-2 bg-admin-input/50 border border-admin-border rounded-md text-admin-text text-sm min-h-[38px] break-words whitespace-pre-wrap">
          {displayValue || (
            <span className="text-admin-muted italic text-xs">
              Using default value
            </span>
          )}
        </div>
      )}

      {isEmpty && editMode && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <X className="w-3 h-3" />
          This field cannot be empty
        </p>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ContentEditorManagement() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Saved state — what's persisted in the backend
  const [savedOverrides, setSavedOverrides] = useState<Record<string, string>>(
    {},
  );
  // Working state — what the admin is currently editing
  const [workingOverrides, setWorkingOverrides] = useState<
    Record<string, string>
  >({});
  // Loading / saving / status
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle",
  );
  const [editMode, setEditMode] = useState(false);
  const iframeLoaded = useRef(false);

  // Count unsaved changes
  const changedKeys = Object.keys(workingOverrides).filter(
    (k) => workingOverrides[k] !== (savedOverrides[k] ?? ""),
  );
  const hasUnsaved = changedKeys.length > 0;

  // Check for empty required fields when in edit mode
  const hasEmptyField = Object.keys(DEFAULTS).some(
    (k) =>
      editMode &&
      (workingOverrides[k] ?? "").trim().length === 0 &&
      (savedOverrides[k] ?? "").trim().length > 0,
  );

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
            // ignore
          }
        }
        // Populate working overrides: for each key, use saved override or default
        const populated: Record<string, string> = {};
        for (const key of Object.keys(DEFAULTS)) {
          populated[key] = parsed[key] ?? DEFAULTS[key] ?? "";
        }
        setSavedOverrides(populated);
        setWorkingOverrides(populated);
      })
      .catch(() => {
        // Backend unavailable — load with defaults
        const defaults = { ...DEFAULTS };
        setSavedOverrides(defaults);
        setWorkingOverrides(defaults);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadOverrides();
  }, [loadOverrides]);

  const handleFieldChange = (key: string, value: string) => {
    setWorkingOverrides((prev) => ({ ...prev, [key]: value }));
    if (saveStatus !== "idle") setSaveStatus("idle");
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      // Only save keys that differ from the default (to keep payload small)
      const toSave: Record<string, string> = {};
      for (const key of Object.keys(workingOverrides)) {
        if (workingOverrides[key] !== DEFAULTS[key]) {
          toSave[key] = workingOverrides[key];
        }
      }
      const actor = await createActorWithConfig();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).saveContentOverrides(JSON.stringify(toSave));
      setSavedOverrides({ ...workingOverrides });
      setSaveStatus("saved");
      // Auto-reload iframe after save
      if (iframeRef.current) {
        iframeRef.current.src = "/";
      }
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setWorkingOverrides({ ...savedOverrides });
    setSaveStatus("idle");
  };

  const handleReloadPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = "/";
    }
  };

  const toggleEditMode = () => {
    if (editMode && hasUnsaved) {
      // Discard unsaved changes when toggling off
      handleDiscard();
    }
    setEditMode((m) => !m);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin" />
        <span className="ml-3 text-admin-muted text-sm">Loading content…</span>
      </div>
    );
  }

  return (
    <div data-ocid="content-editor.panel" className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-admin-text">Content Editor</h2>
          <p className="text-admin-muted text-sm mt-0.5">
            Edit any visible text on the public site. Changes are saved to the
            backend and reflected immediately.
          </p>
        </div>

        {/* Edit Mode Toggle */}
        <button
          type="button"
          data-ocid="content-editor.toggle"
          onClick={toggleEditMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border transition-all duration-200 flex-shrink-0 ${
            editMode
              ? "bg-[#E8C84A] text-[#2a1d00] border-[#C9A832] shadow-md"
              : "bg-admin-input text-admin-muted border-admin-border hover:border-admin-accent/50"
          }`}
        >
          <Zap className="w-4 h-4" />
          {editMode ? "Edit Mode: On" : "Edit Mode: Off"}
        </button>
      </div>

      {/* Action Bar */}
      {editMode && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-admin-card border border-admin-border rounded-lg">
          <button
            type="button"
            data-ocid="content-editor.save_button"
            onClick={handleSave}
            disabled={saving || !hasUnsaved || hasEmptyField}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#E8C84A] text-[#2a1d00] text-sm font-semibold rounded-md hover:bg-[#d4b53e] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-[#2a1d00]/30 border-t-[#2a1d00] rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? "Saving…" : "Save All Changes"}
          </button>

          {hasUnsaved && (
            <button
              type="button"
              data-ocid="content-editor.discard_button"
              onClick={handleDiscard}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-admin-muted hover:text-admin-text border border-admin-border rounded-md transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Discard Changes
            </button>
          )}

          {/* Status */}
          <div className="ml-auto flex items-center gap-2">
            {hasEmptyField && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <X className="w-3.5 h-3.5" />
                Fix empty fields before saving
              </span>
            )}
            {saveStatus === "saved" && !saving && (
              <span
                data-ocid="content-editor.success_state"
                className="text-xs text-green-400 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                All changes saved
              </span>
            )}
            {saveStatus === "error" && (
              <span
                data-ocid="content-editor.error_state"
                className="text-xs text-red-400 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Save failed. Try again.
              </span>
            )}
            {hasUnsaved && saveStatus === "idle" && !saving && (
              <span
                data-ocid="content-editor.loading_state"
                className="text-xs text-[#E8C84A] flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8C84A] inline-block" />
                {changedKeys.length} unsaved change
                {changedKeys.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Two-column layout: Fields | Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Accordion Fields */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-admin-muted uppercase tracking-wider">
              {editMode ? "Editable Fields" : "Content Overview"}
            </p>
            {!editMode && (
              <span className="text-xs text-admin-muted italic">
                Toggle Edit Mode to make changes
              </span>
            )}
          </div>

          <div data-ocid="content-editor.list" className="space-y-2">
            {SECTIONS.map((section) => (
              <SectionPanel
                key={section.id}
                section={section}
                current={workingOverrides}
                saved={savedOverrides}
                editMode={editMode}
                onChange={handleFieldChange}
              />
            ))}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-admin-muted uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Live Preview
            </p>
            <button
              type="button"
              data-ocid="content-editor.reload_button"
              onClick={handleReloadPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-admin-muted hover:text-admin-text border border-admin-border hover:border-admin-accent/50 rounded-md transition-all"
              title="Reload preview"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload Preview
            </button>
          </div>

          <div
            className="relative rounded-lg overflow-hidden border border-admin-border bg-admin-bg"
            style={{ height: "600px" }}
          >
            <div className="absolute top-0 left-0 right-0 z-10 px-3 py-1.5 bg-admin-card border-b border-admin-border flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#E8C84A]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[10px] text-admin-muted font-mono truncate">
                / — public site preview
              </span>
            </div>
            <iframe
              ref={iframeRef}
              src="/"
              title="Live site preview"
              className="w-full h-full"
              style={{
                marginTop: "32px",
                height: "calc(100% - 32px)",
                pointerEvents: "none",
                border: "none",
              }}
              onLoad={() => {
                iframeLoaded.current = true;
              }}
            />
          </div>

          <p className="text-[11px] text-admin-muted/60 text-center">
            Preview is read-only. Save changes then click &quot;Reload
            Preview&quot; to see them reflected.
          </p>
        </div>
      </div>
    </div>
  );
}
