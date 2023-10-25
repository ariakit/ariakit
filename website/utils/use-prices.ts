import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Price } from "./stripe.js";

export function usePrices(): UseQueryResult<Price[]> {
  return useQuery<Price[]>({
    queryKey: ["prices"],
    async queryFn() {
      const res = await fetch("/api/prices");
      return res.json();
    },
  });
}
