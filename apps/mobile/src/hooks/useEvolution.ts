import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CheckinInput, CreateGoalInput, Goal, GoalStatus, MeasurementInput, ProgressResponse } from "@tfit/types";
import { apiFetch } from "@/lib/api";

export function useProgress() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["progress"],
    enabled: isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<ProgressResponse>("/api/progress", token);
    },
  });
}

export function useSubmitCheckin() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CheckinInput) => {
      const token = await getToken();
      return apiFetch("/api/checkins", token, { method: "POST", body: JSON.stringify(input) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress"] }),
  });
}

export function useLogBodyMetric() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { weightKg: number; bodyFatPercent?: number }) => {
      const token = await getToken();
      return apiFetch("/api/body-metrics", token, { method: "POST", body: JSON.stringify(input) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress"] }),
  });
}

export function useLogMeasurement() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<MeasurementInput>) => {
      const token = await getToken();
      return apiFetch("/api/measurements", token, { method: "POST", body: JSON.stringify(input) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress"] }),
  });
}

export function useCreateGoal() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      const token = await getToken();
      return apiFetch<{ goal: Goal }>("/api/goals", token, { method: "POST", body: JSON.stringify(input) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress"] }),
  });
}

export function useUpdateGoal() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: GoalStatus }) => {
      const token = await getToken();
      return apiFetch<{ goal: Goal }>(`/api/goals/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress"] }),
  });
}
