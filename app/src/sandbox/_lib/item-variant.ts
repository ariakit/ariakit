import { useEffect, useState } from "react";

/**
 * How an item fixture renders its items. `base` renders ordinary Ariakit items;
 * the other variants render offscreen items in the matching offscreen mode.
 */
export type ItemVariant = "base" | "passive" | "lazy";

/**
 * Reads the variant from the `item` search param after hydration, so one built
 * fixture serves every side of a paired performance comparison and both sides
 * load the same bundle.
 */
export function useItemVariant() {
  const [variant, setVariant] = useState<ItemVariant>("base");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("item");
    if (value === "passive" || value === "lazy") {
      setVariant(value);
    }
  }, []);
  return variant;
}
