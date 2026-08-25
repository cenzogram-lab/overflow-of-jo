import { CheckCircle, RotateCcw, Upload } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import {
  STORAGE_KEYS,
  fileToDataURL,
  getSiteImageFromBackend,
  removeSiteImageFromBackend,
  setSiteImageOnBackend,
} from "../../utils/adminStorage";
import { validateImageFile } from "../../utils/fileValidation";

interface SiteImageItem {
  key: string;
  label: string;
  description: string;
  defaultSrc: string;
}

const SITE_IMAGES: SiteImageItem[] = [
  {
    key: STORAGE_KEYS.HERO_IMAGE,
    label: "Hero Background",
    description:
      "The full-screen background image on the homepage hero section.",
    defaultSrc: "/assets/generated/hero-bg.dim_1440x900.png",
  },
  {
    key: STORAGE_KEYS.LOGO_IMAGE,
    label: "Logo / Brand Icon",
    description: "The coffee cup icon shown in the navigation bar.",
    defaultSrc: "",
  },
  {
    key: STORAGE_KEYS.ABOUT_IMAGE,
    label: "About Section Photo",
    description: "The photo displayed in the About / Our Mission section.",
    defaultSrc: "/assets/generated/about-illustration.dim_600x400.png",
  },
];

export default function SiteImagesManagement() {
  const [images, setImages] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Load all images from backend on mount
  useEffect(() => {
    Promise.all(
      SITE_IMAGES.map((item) =>
        getSiteImageFromBackend(item.key).then((value) => ({
          key: item.key,
          value,
        })),
      ),
    )
      .then((results) => {
        const result: Record<string, string | null> = {};
        for (const { key, value } of results) {
          result[key] = value;
        }
        setImages(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpload = async (item: SiteImageItem, file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrors((e) => ({
        ...e,
        [item.key]: validation.error ?? "Invalid file",
      }));
      return;
    }
    setErrors((e) => ({ ...e, [item.key]: "" }));
    setUploading((u) => ({ ...u, [item.key]: true }));
    try {
      const dataUrl = await fileToDataURL(file);
      await setSiteImageOnBackend(item.key, dataUrl);
      setImages((prev) => ({ ...prev, [item.key]: dataUrl }));
      setSaved((s) => ({ ...s, [item.key]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [item.key]: false })), 2000);
    } catch (err: any) {
      setErrors((e) => ({ ...e, [item.key]: err.message ?? "Upload failed" }));
    } finally {
      setUploading((u) => ({ ...u, [item.key]: false }));
    }
  };

  const handleReset = async (item: SiteImageItem) => {
    try {
      await removeSiteImageFromBackend(item.key);
      setImages((prev) => ({ ...prev, [item.key]: null }));
      setSaved((s) => ({ ...s, [item.key]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [item.key]: false })), 2000);
    } catch (err: any) {
      setErrors((e) => ({ ...e, [item.key]: err.message ?? "Reset failed" }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin" />
        <span className="ml-3 text-admin-muted text-sm">Loading images…</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-admin-text">Site Images</h2>
        <p className="text-admin-muted text-sm mt-0.5">
          Upload custom images for key sections of the public site.
        </p>
      </div>

      <div className="space-y-6">
        {SITE_IMAGES.map((item) => {
          const currentImage = images[item.key];
          const displaySrc = currentImage ?? item.defaultSrc;
          const isCustom = !!currentImage;

          return (
            <div
              key={item.key}
              className="bg-admin-card border border-admin-border rounded-lg p-5"
            >
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Preview */}
                <div className="flex-shrink-0">
                  <p className="text-xs font-medium text-admin-muted mb-2">
                    Current Preview
                  </p>
                  {item.key === STORAGE_KEYS.LOGO_IMAGE ? (
                    <div className="w-24 h-24 rounded-lg border border-admin-border bg-admin-input flex items-center justify-center overflow-hidden">
                      {displaySrc ? (
                        <img
                          src={displaySrc}
                          alt={item.label}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-900 flex items-center justify-center">
                          <span className="text-amber-100 text-xs font-bold">
                            OJ
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-40 h-24 rounded-lg border border-admin-border overflow-hidden bg-admin-input">
                      {displaySrc ? (
                        <img
                          src={displaySrc}
                          alt={item.label}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-admin-muted text-xs">
                          No image
                        </div>
                      )}
                    </div>
                  )}
                  {isCustom && (
                    <span className="inline-block mt-1.5 text-xs text-admin-accent font-medium">
                      Custom
                    </span>
                  )}
                </div>

                {/* Info & Controls */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-admin-text mb-0.5">
                    {item.label}
                  </h3>
                  <p className="text-xs text-admin-muted mb-4">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileRefs.current[item.key]?.click()}
                      disabled={uploading[item.key]}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs bg-admin-accent text-admin-accent-text rounded-md hover:bg-admin-accent-hover disabled:opacity-50 transition-all"
                    >
                      {uploading[item.key] ? (
                        <div className="w-3.5 h-3.5 border-2 border-admin-accent-text/30 border-t-admin-accent-text rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      {uploading[item.key]
                        ? "Uploading..."
                        : "Upload New Image"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReset(item)}
                      disabled={uploading[item.key]}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs border border-admin-border text-admin-muted hover:text-admin-text hover:border-admin-accent/50 rounded-md transition-all disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset to Default
                    </button>

                    {saved[item.key] && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Saved!
                      </span>
                    )}
                  </div>

                  {errors[item.key] && (
                    <p className="text-xs text-red-400 mt-2">
                      {errors[item.key]}
                    </p>
                  )}

                  <input
                    ref={(el) => {
                      fileRefs.current[item.key] = el;
                    }}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(item, file);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
