import { useAuth } from "@clerk/expo";
import { useMutation } from "@tanstack/react-query";
import type { LogSetInput, WorkoutDetail, WorkoutSession } from "@tfit/types";
import { apiFetch } from "@/lib/api";

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

  return useMutation({
    mutationFn: async (input: LogSetInput) => {
      const token = await getToken();
      return apiFetch<{ isNewPersonalRecord: boolean }>(`/api/workouts/sessions/${sessionId}/sets`, token, {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
  });
}

export function useCompleteSession(sessionId: string) {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return apiFetch<{ session: WorkoutSession }>(`/api/workouts/sessions/${sessionId}/complete`, token, {
        method: "POST",
      });
    },
  });
}
