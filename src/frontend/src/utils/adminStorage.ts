// Admin content storage — backed by Internet Computer canister
// All reads/writes go to the backend so changes are visible on every device.

import { HttpAgent } from "@icp-sdk/core/agent";
import { createActorWithConfig, loadConfig } from "../config";
import { StorageClient } from "./StorageClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getActor(): Promise<any> {
  return createActorWithConfig();
}

export const STORAGE_KEYS = {
  HERO_IMAGE: "admin_hero_image",
  LOGO_IMAGE: "admin_logo_image",
  ABOUT_IMAGE: "admin_about_image",
  SOCIAL_GRID: "admin_social_grid",
  MENU_CATEGORIES: "admin_menu_categories",
} as const;

export interface AdminDrinkItem {
  id: string;
  name: string;
  description: string;
  image: string; // legacy base64 data URL or asset path
  imageKey?: string; // reference to a separately stored drink image
}

export interface AdminMenuCategory {
  id: string;
  name: string;
  items: AdminDrinkItem[];
}

// Convert file to base64 data URL (used for local preview only)
export async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Upload a file to blob storage and return a direct URL. Used for drink
// images and for hero video, which is far too large to inline as base64.
export async function uploadFileToBlobStorage(file: File): Promise<string> {
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(() => {});
  }
  const storageClient = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { hash } = await storageClient.putFile(bytes);
  return storageClient.getDirectURL(hash);
}

// ─── Site Images ──────────────────────────────────────────────────────────────

export async function getSiteImageFromBackend(
  key: string,
): Promise<string | null> {
  try {
    const actor = await getActor();
    let result = "";
    if (key === STORAGE_KEYS.HERO_IMAGE) {
      result = await actor.getHeroImageBase64();
    } else if (key === STORAGE_KEYS.LOGO_IMAGE) {
      result = await actor.getLogoImageBase64();
    } else if (key === STORAGE_KEYS.ABOUT_IMAGE) {
      result = await actor.getAboutImageBase64();
    }
    return result || null;
  } catch {
    return null;
  }
}

export async function setSiteImageOnBackend(
  key: string,
  dataUrl: string,
): Promise<void> {
  const actor = await getActor();
  if (key === STORAGE_KEYS.HERO_IMAGE) {
    await actor.saveHeroImageBase64(dataUrl);
  } else if (key === STORAGE_KEYS.LOGO_IMAGE) {
    await actor.saveLogoImageBase64(dataUrl);
  } else if (key === STORAGE_KEYS.ABOUT_IMAGE) {
    await actor.saveAboutImageBase64(dataUrl);
  }
}

export async function removeSiteImageFromBackend(key: string): Promise<void> {
  // Save empty string to reset to default
  const actor = await getActor();
  if (key === STORAGE_KEYS.HERO_IMAGE) {
    await actor.saveHeroImageBase64("");
  } else if (key === STORAGE_KEYS.LOGO_IMAGE) {
    await actor.saveLogoImageBase64("");
  } else if (key === STORAGE_KEYS.ABOUT_IMAGE) {
    await actor.saveAboutImageBase64("");
  }
}

// ─── Social Grid ──────────────────────────────────────────────────────────────

export async function getSocialGridFromBackend(): Promise<(string | null)[]> {
  try {
    const actor = await getActor();
    const raw = await actor.getSocialGridJson();
    if (!raw) return Array(9).fill(null);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : Array(9).fill(null);
  } catch {
    return Array(9).fill(null);
  }
}

export async function setSocialGridSlotOnBackend(
  index: number,
  dataUrl: string,
): Promise<void> {
  const current = await getSocialGridFromBackend();
  const grid = current.length === 9 ? [...current] : Array(9).fill(null);
  grid[index] = dataUrl;
  const actor = await getActor();
  await actor.saveSocialGridJson(JSON.stringify(grid));
}

export async function removeSocialGridSlotOnBackend(
  index: number,
): Promise<void> {
  const current = await getSocialGridFromBackend();
  const grid = current.length === 9 ? [...current] : Array(9).fill(null);
  grid[index] = null;
  const actor = await getActor();
  await actor.saveSocialGridJson(JSON.stringify(grid));
}

// ─── Menu Categories ──────────────────────────────────────────────────────────

export async function getMenuCategoriesFromBackend(): Promise<
  AdminMenuCategory[] | null
> {
  try {
    const actor = await getActor();
    const raw = await actor.getMenuCategoriesJson();
    if (!raw) return null;
    return JSON.parse(raw) as AdminMenuCategory[];
  } catch {
    return null;
  }
}

export async function saveMenuCategoriesToBackend(
  categories: AdminMenuCategory[],
): Promise<void> {
  const actor = await getActor();
  await actor.saveMenuCategoriesJson(JSON.stringify(categories));
}

// ─── Drink Images (stored separately from the menu payload) ──────────────────

// Upload a drink image to the backend under a unique key. The menu item stores
// only this key (reference), keeping the menu JSON small.
export async function saveDrinkImageToBackend(
  key: string,
  base64: string,
): Promise<void> {
  const actor = await getActor();
  await actor.saveDrinkImage(key, base64);
}

// Fetch a drink image by its key. Returns null when the image is missing.
export async function getDrinkImageFromBackend(
  key: string,
): Promise<string | null> {
  try {
    const actor = await getActor();
    const result = await actor.getDrinkImage(key);
    return result || null;
  } catch {
    return null;
  }
}

// ─── Instagram URL Slots (Find Us Online) ────────────────────────────────────
// Reuses the same backend socialGridJson storage as the legacy base64 grid,
// but stores Instagram post URL strings (or null) instead of base64 data.

export async function getInstagramSlotsFromBackend(): Promise<
  (string | null)[]
> {
  try {
    const actor = await getActor();
    const raw = await actor.getSocialGridJson();
    if (!raw) return Array(9).fill(null);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return Array(9).fill(null);
    // Normalize to a 9-slot array of (string | null)
    const slots: (string | null)[] = Array(9).fill(null);
    for (let i = 0; i < 9 && i < parsed.length; i++) {
      const entry = parsed[i];
      slots[i] = typeof entry === "string" && entry.length > 0 ? entry : null;
    }
    return slots;
  } catch {
    return Array(9).fill(null);
  }
}

export async function setInstagramSlotOnBackend(
  index: number,
  url: string,
): Promise<void> {
  if (index < 0 || index > 8) return;
  const current = await getInstagramSlotsFromBackend();
  const slots = current.length === 9 ? [...current] : Array(9).fill(null);
  slots[index] = url && url.length > 0 ? url : null;
  const actor = await getActor();
  await actor.saveSocialGridJson(JSON.stringify(slots));
}

export async function removeInstagramSlotOnBackend(
  index: number,
): Promise<void> {
  if (index < 0 || index > 8) return;
  const current = await getInstagramSlotsFromBackend();
  const slots = current.length === 9 ? [...current] : Array(9).fill(null);
  slots[index] = null;
  const actor = await getActor();
  await actor.saveSocialGridJson(JSON.stringify(slots));
}

// ─── Map Address (OpenStreetMap / Nominatim) ──────────────────────────────────

export async function getMapAddressFromBackend(): Promise<string> {
  try {
    const actor = await getActor();
    const address = await actor.getMapAddress();
    return address || "";
  } catch {
    return "";
  }
}

export async function saveMapAddressToBackend(address: string): Promise<void> {
  const actor = await getActor();
  await actor.saveMapAddress(address);
}
