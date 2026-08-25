// Local type definitions for backend data models.
// These mirror what the backend canister returns.

export enum EventType {
  CommunityGathering = "CommunityGathering",
  Wedding = "Wedding",
  ChurchEvent = "ChurchEvent",
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

export interface PrayerRequest {
  id: bigint;
  starred: boolean;
  allowOnSleeve: boolean;
  request: string;
  submittedAt: bigint;
  firstName: string;
}
