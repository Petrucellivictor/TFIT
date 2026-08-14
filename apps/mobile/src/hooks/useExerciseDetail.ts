import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";
import type { ExerciseDetail } from "@tfit/types";
import { apiFetch } from "@/lib/api";

export function useExerciseDetail(id: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["exercise-detail", id],
    enabled: isSignedIn && Boolean(id),
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ exercise: ExerciseDetail }>(`/api/exercises/${id}`, token);
    },
  });
}
