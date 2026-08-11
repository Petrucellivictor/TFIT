import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MeResponse } from "@tfit/types";
import type { OnboardingPayloadInput } from "@tfit/validation";
import { apiFetch } from "@/lib/api";

export function useMe() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["me"],
    enabled: isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<MeResponse>("/api/me", token);
    },
  });
}

export function useSubmitOnboarding() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: OnboardingPayloadInput) => {
      const token = await getToken();
      return apiFetch<{ onboardingCompleted: boolean }>("/api/onboarding", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
