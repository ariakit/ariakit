import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

export function useSubscription(): UseQueryResult<string> {
  const { isLoaded, userId } = useAuth();

  const query = useQuery({
    enabled: isLoaded && !!userId,
    queryKey: ["subscription", userId],
    queryFn: async () => {
      const res = await fetch("/api/subscription");
      return res.json() as Promise<string>;
    },
  });

  return query;
}
