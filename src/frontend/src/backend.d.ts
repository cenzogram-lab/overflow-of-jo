import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface PrayerRequest {
    id: bigint;
    allowOnSleeve: boolean;
    starred: boolean;
    request: string;
    submittedAt: bigint;
    firstName: string;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface Inquiry {
    id: bigint;
    starred: boolean;
    name: string;
    email: string;
    message: string;
    phone: string;
    eventDate: string;
    eventType: EventType;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface UserProfile {
    name: string;
}
export enum EventType {
    CommunityGathering = "CommunityGathering",
    Wedding = "Wedding",
    ChurchEvent = "ChurchEvent"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteDrinkImage(key: string): Promise<boolean>;
    deleteInquiry(id: bigint): Promise<boolean>;
    deletePrayerRequest(id: bigint): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    getAboutImageBase64(): Promise<string>;
    getAllInquiries(): Promise<Array<Inquiry>>;
    getAllPrayerRequests(): Promise<Array<PrayerRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContentOverrides(): Promise<string>;
    getCycles(): Promise<bigint>;
    getDrinkImage(key: string): Promise<string | null>;
    getHeroImageBase64(): Promise<string>;
    getInquiryById(id: bigint): Promise<Inquiry | null>;
    getLogoImageBase64(): Promise<string>;
    getMapAddress(): Promise<string>;
    getMenuCategoriesJson(): Promise<string>;
    getPrayerRequestsWithSleeveConsent(): Promise<Array<PrayerRequest>>;
    getSocialGridJson(): Promise<string>;
    getTotalPrayerRequestsCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveAboutImageBase64(base64Data: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveContentOverrides(json: string): Promise<void>;
    saveDrinkImage(key: string, base64: string): Promise<void>;
    saveHeroImageBase64(base64Data: string): Promise<void>;
    saveLogoImageBase64(base64Data: string): Promise<void>;
    saveMapAddress(address: string): Promise<void>;
    saveMenuCategoriesJson(json: string): Promise<void>;
    saveSocialGridJson(json: string): Promise<void>;
    schema(): Promise<string>;
    starInquiry(id: bigint): Promise<boolean>;
    starPrayerRequest(id: bigint): Promise<boolean>;
    submitInquiry(name: string, email: string, phone: string, eventType: EventType, eventDate: string, message: string): Promise<bigint>;
    submitPrayerRequest(firstName: string, request: string, allowOnSleeve: boolean): Promise<bigint>;
}
