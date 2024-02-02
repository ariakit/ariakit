import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

interface Subscription {
  price: string;
  product: string;
  recurring: boolean;
}

export function useSubscription(): UseQueryResult<Subscription> & {
  userId?: string | null;
  isLoaded: boolean;
} {
  const { isLoaded, userId } = useAuth();

  const query = useQuery<Subscription>({
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
