import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AchievementView, ChallengeView, GamificationProfile } from "@tfit/types";
import { apiFetch } from "@/lib/api";

export function useGamificationProfile() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["gamification-profile"],
    enabled: isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<GamificationProfile>("/api/gamification/profile", token);
    },
  });
}

export function useAchievements() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["achievements"],
    enabled: isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ achievements: AchievementView[] }>("/api/achievements", token);
    },
  });
}

export function useChallenges() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["challenges"],
    enabled: isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ challenges: ChallengeView[] }>("/api/challenges", token);
    },
  });
}

export function useJoinChallenge() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challengeId: string) => {
      const token = await getToken();
      return apiFetch(`/api/challenges/${challengeId}/join`, token, { method: "POST" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["challenges"] }),
  });
}

/** Call after any action whose response includes a `gamification` field, to keep XP/streak/achievements fresh everywhere. */
export function useInvalidateGamification() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["gamification-profile"] });
    queryClient.invalidateQueries({ queryKey: ["achievements"] });
    queryClient.invalidateQueries({ queryKey: ["challenges"] });
  };
}
