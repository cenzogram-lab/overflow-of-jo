/* eslint-disable */
// @ts-nocheck

// Visual QA mock backend. Implements the full backendInterface surface so the
// frontend can render with realistic sample data under VITE_USE_MOCK=true.
// Kept after QA so devs can run `VITE_USE_MOCK=true pnpm dev` for frontend-only
// iteration without a live canister.

import type { backendInterface } from "../backend";

// ─── In-memory mutable state (so admin save flows work in the mock) ───────────

let menuCategoriesJson = JSON.stringify([
  {
    id: "cat-1",
    name: "Espresso Bar",
    items: [
      {
        id: "item-1",
        name: "Honey Latte",
        description:
          "Double espresso, steamed milk, and a drizzle of local wildflower honey.",
        image: "",
      },
      {
        id: "item-2",
        name: "Cortado",
        description: "Equal parts espresso and warm milk for a balanced cup.",
        image: "",
      },
    ],
  },
  {
    id: "cat-2",
    name: "Seasonal Specials",
    items: [
      {
        id: "item-3",
        name: "Spiced Joy Mocha",
        description:
          "Cinnamon, cocoa, and a shot of espresso — tastes like a warm hug.",
        image: "",
      },
    ],
  },
]);

let heroImageBase64 = "";
let logoImageBase64 = "";
let aboutImageBase64 = "";

// 9 Instagram URL slots — first three populated so the public grid renders
// live embeds during visual QA. The remaining six are intentionally empty so
// the empty-state behavior and partial-grid layout are also exercised.
let socialGridJson = JSON.stringify([
  "https://www.instagram.com/p/CxYz123/",
  "https://www.instagram.com/p/CxYz456/",
  "https://www.instagram.com/p/CxYz789/",
  null,
  null,
  null,
  null,
  null,
  null,
]);

let contentOverridesJson = "";

// Default map address per project guidance.
let mapAddress = "";

const inquiries = [
  {
    id: 1n,
    starred: false,
    name: "Sarah Mitchell",
    email: "sarah@example.com",
    phone: "(252) 555-0142",
    eventDate: "2026-08-15",
    eventType: "Wedding" as const,
    message:
      "We'd love to host our wedding rehearsal coffee hour at Overflow of Jo.",
  },
  {
    id: 2n,
    starred: true,
    name: "Pastor David",
    email: "david@wavewilson.org",
    phone: "(252) 555-0188",
    eventDate: "2026-07-20",
    eventType: "ChurchEvent" as const,
    message: "Sunday morning coffee ministry setup for 80 guests.",
  },
];

const prayerRequests = [
  {
    id: 1n,
    firstName: "Marie",
    request:
      "Praying for healing and peace for my mother as she recovers from surgery.",
    allowOnSleeve: true,
    submittedAt: BigInt(Date.now() - 1000 * 60 * 60 * 24),
    starred: false,
  },
  {
    id: 2n,
    firstName: "James",
    request: "Guidance for a new job opportunity in Wilson.",
    allowOnSleeve: true,
    submittedAt: BigInt(Date.now() - 1000 * 60 * 60 * 5),
    starred: true,
  },
  {
    id: 3n,
    firstName: "Anonymous",
    request: "Strength for a friend walking through grief.",
    allowOnSleeve: false,
    submittedAt: BigInt(Date.now() - 1000 * 60 * 30),
    starred: false,
  },
];

let nextId = 3n;

// ─── Mock implementation ─────────────────────────────────────────────────────

export const mockBackend: backendInterface = {
  // Object-storage stubs (not exercised by the public site, but required by
  // the interface so the actor resolves cleanly).
  _immutableObjectStorageBlobsAreLive: async () => [],
  _immutableObjectStorageBlobsToDelete: async () => [],
  _immutableObjectStorageConfirmBlobDeletion: async () => undefined,
  _immutableObjectStorageCreateCertificate: async () => ({
    method: "",
    blob_hash: "",
  }),
  _immutableObjectStorageRefillCashier: async () => ({}),
  _immutableObjectStorageUpdateGatewayPrincipals: async () => undefined,
  _initializeAccessControl: async () => undefined,
  // Called by useActor when authenticated; no-op in mock.
  _initializeAccessControlWithSecret: async () => undefined,

  assignCallerUserRole: async () => undefined,

  deleteInquiry: async (id: bigint) => {
    const idx = inquiries.findIndex((i) => i.id === id);
    if (idx >= 0) {
      inquiries.splice(idx, 1);
      return true;
    }
    return false;
  },

  deletePrayerRequest: async (id: bigint) => {
    const idx = prayerRequests.findIndex((p) => p.id === id);
    if (idx >= 0) {
      prayerRequests.splice(idx, 1);
      return true;
    }
    return false;
  },

  getAboutImageBase64: async () => aboutImageBase64,
  getAllInquiries: async () => inquiries,
  getAllPrayerRequests: async () => prayerRequests,
  getCallerUserProfile: async () => ({ name: "Admin User" }),
  getCallerUserRole: async () => "admin" as const,
  getContentOverrides: async () => contentOverridesJson,
  getCycles: async () => 500_000_000_000n,
  getHeroImageBase64: async () => heroImageBase64,
  getInquiryById: async (id: bigint) =>
    inquiries.find((i) => i.id === id) ?? null,
  getLogoImageBase64: async () => logoImageBase64,
  getMapAddress: async () => mapAddress,
  getMenuCategoriesJson: async () => menuCategoriesJson,
  getPrayerRequestsWithSleeveConsent: async () =>
    prayerRequests.filter((p) => p.allowOnSleeve),
  getSocialGridJson: async () => socialGridJson,
  getTotalPrayerRequestsCount: async () => BigInt(prayerRequests.length),
  getUserProfile: async () => ({ name: "Admin User" }),
  isCallerAdmin: async () => true,

  saveAboutImageBase64: async (data: string) => {
    aboutImageBase64 = data;
  },
  saveCallerUserProfile: async () => undefined,
  saveContentOverrides: async (json: string) => {
    contentOverridesJson = json;
  },
  saveHeroImageBase64: async (data: string) => {
    heroImageBase64 = data;
  },
  saveLogoImageBase64: async (data: string) => {
    logoImageBase64 = data;
  },
  saveMapAddress: async (address: string) => {
    mapAddress = address;
  },
  saveMenuCategoriesJson: async (json: string) => {
    menuCategoriesJson = json;
  },
  saveSocialGridJson: async (json: string) => {
    socialGridJson = json;
  },

  starInquiry: async (id: bigint) => {
    const inquiry = inquiries.find((i) => i.id === id);
    if (inquiry) {
      inquiry.starred = !inquiry.starred;
      return inquiry.starred;
    }
    return false;
  },
  starPrayerRequest: async (id: bigint) => {
    const pr = prayerRequests.find((p) => p.id === id);
    if (pr) {
      pr.starred = !pr.starred;
      return pr.starred;
    }
    return false;
  },

  submitInquiry: async (
    name: string,
    email: string,
    phone: string,
    eventType: any,
    eventDate: string,
    message: string,
  ) => {
    const id = nextId;
    nextId += 1n;
    inquiries.push({
      id,
      starred: false,
      name,
      email,
      phone,
      eventDate,
      eventType,
      message,
    });
    return id;
  },

  submitPrayerRequest: async (
    firstName: string,
    request: string,
    allowOnSleeve: boolean,
  ) => {
    const id = nextId;
    nextId += 1n;
    prayerRequests.push({
      id,
      firstName,
      request,
      allowOnSleeve,
      submittedAt: BigInt(Date.now()),
      starred: false,
    });
    return id;
  },
};
