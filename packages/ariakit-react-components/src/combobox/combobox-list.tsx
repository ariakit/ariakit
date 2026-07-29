import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import type { ElementType } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import { useComposite } from "../composite/composite.tsx";
import type { ComboboxContentOptions } from "./combobox-content.tsx";
import { useComboboxContent } from "./combobox-content.tsx";
import { useComboboxContext } from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `ComboboxList` component.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxList({ store });
 * <Role {...props}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </Role>
 * ```
 */
export const useComboboxList = createHook<TagName, ComboboxListOptions>(
  function useComboboxList({ store, composite, ...props }) {
    const context = useComboboxContext();
    store = store || context;
    props = useComboboxContent({ store, ...props });
    props = useComposite({
      store,
      composite,
      ...props,
      // The combobox control owns the store-wide focus-on-move responder.
      focusOnMove: false,
      unstable_registerBaseElement: false,
    });
    return props;
  },
);

/**
 * Renders a combobox list. The `role` prop is set to `listbox` by default, but
 * can be overriden by any other valid combobox popup role (`listbox`, `menu`,
 * `tree`, `grid` or `dialog`).
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {3-7}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxList>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxList>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxList = forwardRef(function ComboboxList(
  props: ComboboxListProps,
) {
  const htmlProps = useComboboxList(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxListOptions<T extends ElementType = TagName>
  extends
    Omit<CompositeOptions<T>, "focusOnMove" | "unstable_registerBaseElement">,
    Pick<ComboboxContentOptions<T>, "alwaysVisible"> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxListProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxListOptions<T>
>;
