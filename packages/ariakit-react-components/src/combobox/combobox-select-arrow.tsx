import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import type { ElementType } from "react";
import type { PopoverDisclosureArrowOptions } from "../popover/popover-disclosure-arrow.tsx";
import { usePopoverDisclosureArrow } from "../popover/popover-disclosure-arrow.tsx";
import { useComboboxContext } from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "span" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `ComboboxSelectArrow` component.
 * @see https://ariakit.com/components/combobox
 */
export const useComboboxSelectArrow = createHook<
  TagName,
  ComboboxSelectArrowOptions
>(function useComboboxSelectArrow({ store, ...props }) {
  const context = useComboboxContext();
  store = store || context;
  return usePopoverDisclosureArrow({ store, ...props });
});

/**
 * Renders an arrow pointing to the combobox popover position.
 * @see https://ariakit.com/components/combobox
 */
export const ComboboxSelectArrow = forwardRef(function ComboboxSelectArrow(
  props: ComboboxSelectArrowProps,
) {
  const htmlProps = useComboboxSelectArrow(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxSelectArrowOptions<
  T extends ElementType = TagName,
> extends PopoverDisclosureArrowOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook.
   */
  store?: ComboboxStore;
}

export type ComboboxSelectArrowProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxSelectArrowOptions<T>
>;
