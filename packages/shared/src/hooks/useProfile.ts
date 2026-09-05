import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NutriSnapApiClient } from "../api/client";
import type { Profile } from "../api/types";

export function useProfile(api: NutriSnapApiClient, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile(),
    enabled: options.enabled,
  });
}

export function useUpdateProfile(api: NutriSnapApiClient) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Profile>) => api.updateProfile(patch),
    onSuccess: (profile) => {
      queryClient.setQueryData(["profile"], profile);
    },
  });
}
