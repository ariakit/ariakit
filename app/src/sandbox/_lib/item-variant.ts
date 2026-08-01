import { useEffect, useState } from "react";

/**
 * How an item fixture renders its items.
 *
 * `base` renders ordinary Ariakit items from this revision, `passive` and
 * `lazy` render offscreen items in the matching offscreen mode, and `legacy`
 * renders ordinary items from the published version that introduced the
 * offscreen feature.
 *
 * The union derives from the array so the values accepted from the search param
 * and the type cannot drift apart.
 */
const variants = ["base", "passive", "lazy", "legacy"] as const;

export type ItemVariant = (typeof variants)[number];

/**
 * Variants the current revision's fixture tree renders. `legacy` is excluded
 * because it renders a separate tree built on the published package, so it
 * never reaches a component that takes an `offscreenMode`.
 */
export type CurrentItemVariant = Exclude<ItemVariant, "legacy">;

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
    const match = variants.find((candidate) => candidate === value);
    if (match) {
      setVariant(match);
    }
  }, []);
  return variant;
}
