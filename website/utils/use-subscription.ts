import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

export function useSubscription(): UseQueryResult<string> & {
  userId?: string | null;
  isLoaded: boolean;
} {
  const { isLoaded, userId } = useAuth();

  const query = useQuery<string>({
    enabled: isLoaded && !!userId,
    queryKey: ["subscription", userId],
    refetchOnMount: false,
    async queryFn() {
      const res = await fetch("/api/subscription");
      return res.json();
    },
  });

  return { ...query, userId, isLoaded };
}
