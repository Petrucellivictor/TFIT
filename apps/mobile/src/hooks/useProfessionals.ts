import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MyProfessionalProfile, ProfessionalListing } from "@tfit/types";
import type { ProfessionalProfileInput } from "@tfit/validation";
import { apiFetch } from "@/lib/api";

export function useProfessionalDirectory(search?: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["professionals", search ?? ""],
    enabled: isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      const qs = search ? `?search=${encodeURIComponent(search)}` : "";
      return apiFetch<{ professionals: ProfessionalListing[] }>(`/api/professionals${qs}`, token);
    },
  });
}

export function useMyProfessionalProfile() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["professionals-me"],
    enabled: isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ profile: MyProfessionalProfile | null }>("/api/professionals/me", token);
    },
  });
}

export function useSaveProfessionalProfile() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProfessionalProfileInput) => {
      const token = await getToken();
      return apiFetch<{ profile: MyProfessionalProfile }>("/api/professionals/me", token, {
        method: "PUT",
        body: JSON.stringify(input),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals-me"] });
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
    },
  });
}

export function useDeactivateProfessionalProfile() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return apiFetch("/api/professionals/me", token, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals-me"] });
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
    },
  });
}
