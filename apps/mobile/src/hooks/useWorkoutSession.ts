import { useAuth } from "@clerk/expo";
import { useMutation } from "@tanstack/react-query";
import type { GamificationEventResult, LogSetInput, WorkoutDetail, WorkoutSession } from "@tfit/types";
import { apiFetch } from "@/lib/api";
import { useInvalidateGamification } from "./useGamification";

export function useStartSession() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (workoutId: string) => {
      const token = await getToken();
      return apiFetch<{ session: WorkoutSession; workout: WorkoutDetail }>("/api/workouts/sessions", token, {
        method: "POST",
        body: JSON.stringify({ workoutId }),
      });
    },
  });
}

export function useLogSet(sessionId: string) {
  const { getToken } = useAuth();
  const invalidateGamification = useInvalidateGamification();

  return useMutation({
    mutationFn: async (input: LogSetInput) => {
      const token = await getToken();
      return apiFetch<{ isNewPersonalRecord: boolean; gamification: GamificationEventResult }>(
        `/api/workouts/sessions/${sessionId}/sets`,
        token,
        { method: "POST", body: JSON.stringify(input) },
      );
    },
    onSuccess: (data) => {
      if (data.gamification.xpAwarded > 0) invalidateGamification();
    },
  });
}

export function useCompleteSession(sessionId: string) {
  const { getToken } = useAuth();
  const invalidateGamification = useInvalidateGamification();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return apiFetch<{ session: WorkoutSession; gamification: GamificationEventResult }>(
        `/api/workouts/sessions/${sessionId}/complete`,
        token,
        { method: "POST" },
      );
    },
    onSuccess: invalidateGamification,
  });
}
