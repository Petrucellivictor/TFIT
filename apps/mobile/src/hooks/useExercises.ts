import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface ExerciseListItem {
  id: string;
  slug: string;
  name: string;
  primaryMuscle: string;
  equipment: string;
  level: string;
}

export function useExercises(search: string, muscle?: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["exercises", search, muscle ?? ""],
    enabled: isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (muscle) params.set("muscle", muscle);
      const qs = params.toString();
      return apiFetch<{ exercises: ExerciseListItem[] }>(`/api/exercises${qs ? `?${qs}` : ""}`, token);
    },
  });
}
