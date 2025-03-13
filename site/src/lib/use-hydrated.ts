import { useSafeLayoutEffect } from "@ariakit/react-core/utils/hooks";
import { useState } from "react";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useSafeLayoutEffect(() => setHydrated(true), []);
  return hydrated;
}
