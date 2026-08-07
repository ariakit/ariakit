import { createHook } from "@ariakit/react-utils";
import { getPopupRole } from "@ariakit/utils";
import type { ElementType } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import { useComposite } from "../composite/composite.tsx";
import { getScrollItemIntoView } from "./__utils.ts";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns the props that identify the combobox control in the accessibility
 * tree. The popup role falls back to `listbox`, unlike the `dialog` fallback
 * that generic dialog disclosures apply.
 */
export function getComboboxControlProps(contentElement?: HTMLElement | null) {
  return {
    role: "combobox",
    "aria-haspopup": getPopupRole(contentElement, "listbox"),
  } as const;
}

/**
 * Returns props that turn an element into the composite widget for the
 * combobox items. This is the primary `role="combobox"` element rendered by
 * either
 * [`Combobox`](https://ariakit.com/reference/combobox)/[`ComboboxInput`](https://ariakit.com/reference/combobox-input)
 * or [`ComboboxSelect`](https://ariakit.com/reference/combobox-select). It's
 * distinct from
 * [`ComboboxDisclosure`](https://ariakit.com/reference/combobox-disclosure),
 * which is an auxiliary popup toggle.
 * @see https://ariakit.com/components/combobox
 */
export const useComboboxControl = createHook<TagName, ComboboxControlOptions>(
  function useComboboxControl({ store, focusable = true, ...props }) {
    return useComposite<TagName>({
      store,
      unstable_scrollIntoView: getScrollItemIntoView(store),
      focusable,
      ...props,
    });
  },
);

export interface ComboboxControlOptions<
  T extends ElementType = TagName,
> extends CompositeOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook, already resolved by the component rendering the control.
   */
  store: ComboboxStore;
}
