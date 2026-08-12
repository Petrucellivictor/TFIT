import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { WorkoutPlanDetail, WorkoutPlanSummary } from "@tfit/types";
import type { CreateManualPlanInput } from "@tfit/validation";
import { apiFetch } from "@/lib/api";

export function useWorkoutPlans() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["workout-plans"],
    enabled: isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ plans: WorkoutPlanSummary[] }>("/api/workouts/plans", token);
    },
  });
}

export function useWorkoutPlanDetail(planId: string | undefined) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["workout-plan-detail", planId],
    enabled: isSignedIn && Boolean(planId),
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ plan: WorkoutPlanDetail }>(`/api/workouts/plans/${planId}`, token);
    },
  });
}

function useInvalidatePlans() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
    queryClient.invalidateQueries({ queryKey: ["workout-plan-detail"] });
    queryClient.invalidateQueries({ queryKey: ["workout-plan"] });
  };
}

export function useCreateManualPlan() {
  const { getToken } = useAuth();
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: async (input: CreateManualPlanInput) => {
      const token = await getToken();
      return apiFetch<{ planId: string; warnings: { message: string }[] }>("/api/workouts/plans", token, {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    onSuccess: invalidate,
  });
}

export function useDuplicatePlan() {
  const { getToken } = useAuth();
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: async (planId: string) => {
      const token = await getToken();
      return apiFetch<{ planId: string }>(`/api/workouts/plans/${planId}/duplicate`, token, { method: "POST" });
    },
    onSuccess: invalidate,
  });
}

export function useSharePlan() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ planId, handle }: { planId: string; handle: string }) => {
      const token = await getToken();
      return apiFetch<{ sentTo: string }>(`/api/workouts/plans/${planId}/share`, token, {
        method: "POST",
        body: JSON.stringify({ handle }),
      });
    },
  });
}

export function useActivatePlan() {
  const { getToken } = useAuth();
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: async (planId: string) => {
      const token = await getToken();
      return apiFetch(`/api/workouts/plans/${planId}/activate`, token, { method: "POST" });
    },
    onSuccess: invalidate,
  });
}
