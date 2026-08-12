import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MyProfessionalProfile, MyProfessionalServiceItem, ProfessionalListing } from "@tfit/types";
import type { ProfessionalProfileInput, ProfessionalServiceInput, ProfessionalServiceUpdateInput } from "@tfit/validation";
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

export function useMyServices() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["professionals-me-services"],
    enabled: isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ services: MyProfessionalServiceItem[] }>("/api/professionals/me/services", token);
    },
  });
}

function useInvalidateServices() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["professionals-me-services"] });
    queryClient.invalidateQueries({ queryKey: ["professionals"] });
  };
}

export function useCreateService() {
  const { getToken } = useAuth();
  const invalidate = useInvalidateServices();

  return useMutation({
    mutationFn: async (input: ProfessionalServiceInput) => {
      const token = await getToken();
      return apiFetch<{ service: MyProfessionalServiceItem }>("/api/professionals/me/services", token, {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    onSuccess: invalidate,
  });
}

export function useUpdateService() {
  const { getToken } = useAuth();
  const invalidate = useInvalidateServices();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ProfessionalServiceUpdateInput }) => {
      const token = await getToken();
      return apiFetch<{ service: MyProfessionalServiceItem }>(`/api/professionals/me/services/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
    },
    onSuccess: invalidate,
  });
}

export function useDeleteService() {
  const { getToken } = useAuth();
  const invalidate = useInvalidateServices();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiFetch(`/api/professionals/me/services/${id}`, token, { method: "DELETE" });
    },
    onSuccess: invalidate,
  });
}

export function useReorderServices() {
  const { getToken } = useAuth();
  const invalidate = useInvalidateServices();

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const token = await getToken();
      return apiFetch("/api/professionals/me/services/reorder", token, {
        method: "POST",
        body: JSON.stringify({ orderedIds }),
      });
    },
    onSuccess: invalidate,
  });
}
