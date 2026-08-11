import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { WorkoutPlanDetail } from "@tfit/types";
import { apiFetch } from "@/lib/api";

export function useWorkoutPlan() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["workout-plan"],
    enabled: isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ plan: WorkoutPlanDetail | null }>("/api/workouts", token);
    },
  });
}

export function useGenerateWorkout() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return apiFetch<{ plan: WorkoutPlanDetail }>("/api/training/generate", token, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plan"] });
    },
  });
}
