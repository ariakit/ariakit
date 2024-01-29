import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type { PlusPrice } from "./stripe.js";

export function usePrice(): UseQueryResult<PlusPrice> {
  return useQuery<PlusPrice>({
    queryKey: ["price"],
    async queryFn() {
      const res = await fetch("/api/price");
      return res.json();
    },
  });
}
