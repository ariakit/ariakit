import { useEffect, useState } from "react";

/**
 * Which Ariakit version an item fixture renders its items with. `head` uses this
 * revision and `legacy` uses the published release that the comparison measures
 * against.
 *
 * The union derives from the array so the values accepted from the search param
 * and the type cannot drift apart.
 */
const variants = ["head", "legacy"] as const;

export type ItemVariant = (typeof variants)[number];

/**
 * Reads the variant from the `item` search param after hydration, so one built
 * fixture serves both sides of a paired performance comparison and both sides
 * load the same bundle.
 */
export function useItemVariant() {
  const [variant, setVariant] = useState<ItemVariant>("head");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("item");
    const match = variants.find((candidate) => candidate === value);
    if (match) {
      setVariant(match);
    }
  }, []);
  return variant;
}
