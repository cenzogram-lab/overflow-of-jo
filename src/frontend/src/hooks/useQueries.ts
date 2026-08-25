import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EventType } from "../types";
import { useActor } from "./useActor";

export interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  eventType: EventType;
  eventDate: string;
  message: string;
}

export interface PrayerRequestFormData {
  firstName: string;
  request: string;
  allowOnSleeve: boolean;
}

export function useSubmitInquiry() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return {
    ...useMutation({
      mutationFn: async (data: InquiryFormData) => {
        let currentActor = actor;
        if (!currentActor) {
          const cached = queryClient.getQueryData<typeof actor>([
            "actor",
            undefined,
          ]);
          currentActor = cached ?? null;
        }
        if (!currentActor) {
          throw new Error(
            "Backend not available. Please try again in a moment.",
          );
        }
        return (currentActor as any).submitInquiry(
          data.name,
          data.email,
          data.phone,
          data.eventType,
          data.eventDate,
          data.message,
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      },
    }),
    isActorLoading: isFetching,
  };
}

export function useSubmitPrayerRequest() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return {
    ...useMutation({
      mutationFn: async (data: PrayerRequestFormData) => {
        let currentActor = actor;
        if (!currentActor) {
          const cached = queryClient.getQueryData<typeof actor>([
            "actor",
            undefined,
          ]);
          currentActor = cached ?? null;
        }
        if (!currentActor) {
          throw new Error(
            "Backend not available. Please try again in a moment.",
          );
        }
        return (currentActor as any).submitPrayerRequest(
          data.firstName,
          data.request,
          data.allowOnSleeve,
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["prayerRequests"] });
      },
    }),
    isActorLoading: isFetching,
  };
}

export { EventType };
