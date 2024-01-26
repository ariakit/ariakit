import type { ElementType } from "react";
import { useRef } from "react";
import { invariant, removeUndefinedValues } from "@ariakit/core/utils/misc";
import { isHidden } from "../disclosure/disclosure-content.js";
import type { DisclosureContentOptions } from "../disclosure/disclosure-content.js";
import {
  useAttribute,
  useId,
  useMergeRefs,
  useWrapElement,
} from "../utils/hooks.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Options, Props } from "../utils/types.js";
import {
  ComboboxScopedContextProvider,
  useComboboxProviderContext,
} from "./combobox-context.js";
import type { ComboboxStore } from "./combobox-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `ComboboxList` component.
 * @see https://ariakit.org/components/combobox
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
  function useComboboxList({ store, alwaysVisible, ...props }) {
    const context = useComboboxProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxList must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const ref = useRef<HTMLType>(null);
    const id = useId(props.id);

    props = useWrapElement(
      props,
      (element) => (
        <ComboboxScopedContextProvider value={store}>
          {element}
        </ComboboxScopedContextProvider>
      ),
      [store],
    );

    const mounted = store.useState("mounted");
    const hidden = isHidden(mounted, props.hidden, alwaysVisible);
    const style = hidden ? { ...props.style, display: "none" } : props.style;

    const multiSelectable = store.useState((state) =>
      Array.isArray(state.selectedValue),
    );
    const role = useAttribute(ref, "role", props.role);
    const isCompositeRole =
      role === "listbox" || role === "tree" || role === "grid";
    const ariaMultiSelectable = isCompositeRole
      ? multiSelectable || undefined
      : undefined;

    props = {
      id,
      hidden,
      role: "listbox",
      "aria-multiselectable": ariaMultiSelectable,
      ...props,
      ref: useMergeRefs(id ? store.setContentElement : null, ref, props.ref),
      style,
    };

    return removeUndefinedValues(props);
  },
);

/**
 * Renders a combobox list. The `role` prop is set to `listbox` by default, but
 * can be overriden by any other valid combobox popup role (`listbox`, `menu`,
 * `tree`, `grid` or `dialog`).
 * @see https://ariakit.org/components/combobox
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
  extends Options,
    Pick<DisclosureContentOptions<T>, "alwaysVisible"> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxListProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxListOptions<T>
>;
