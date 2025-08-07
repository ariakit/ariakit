import { invariant, removeUndefinedValues } from "@ariakit/core/utils/misc";
import type { ElementType } from "react";
import { useRef, useState } from "react";
import type { DisclosureContentOptions } from "../disclosure/disclosure-content.tsx";
import { isHidden } from "../disclosure/disclosure-content.tsx";
import {
  useAttribute,
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
  useWrapElement,
} from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import {
  ComboboxListRoleContext,
  ComboboxScopedContextProvider,
  useComboboxContext,
  useComboboxScopedContext,
} from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

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
    const scopedContext = useComboboxScopedContext(true);
    const context = useComboboxContext();
    store = store || context;
    const scopedContextSameStore = !!store && store === scopedContext;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxList must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const ref = useRef<HTMLType>(null);
    const id = useId(props.id);
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

    const [hasListboxInside, setHasListboxInside] = useState(false);
    const contentElement = store.useState("contentElement");

    // We support nested <ComboboxList> elements (usually in the form of
    // ComboboxPopover>ComboboxList), but we can't have nested listbox roles, so
    // we check here if there's already a listbox element inside the current
    // element.
    useSafeLayoutEffect(() => {
      if (!mounted) return;
      const element = ref.current;
      if (!element) return;
      if (contentElement !== element) return;
      const callback = () => {
        setHasListboxInside(!!element.querySelector("[role='listbox']"));
      };
      const observer = new MutationObserver(callback);
      observer.observe(element, {
        subtree: true,
        childList: true,
        attributeFilter: ["role"],
      });
      callback();
      return () => observer.disconnect();
    }, [mounted, contentElement]);

    if (!hasListboxInside) {
      props = {
        role: "listbox",
        "aria-multiselectable": ariaMultiSelectable,
        ...props,
      };
    }

    props = useWrapElement(
      props,
      (element) => (
        <ComboboxScopedContextProvider value={store}>
          <ComboboxListRoleContext.Provider value={role}>
            {element}
          </ComboboxListRoleContext.Provider>
        </ComboboxScopedContextProvider>
      ),
      [store, role],
    );

    // When nesting ComboboxList elements, the content element should be
    // assigned to the topmost ComboboxList element.
    const setContentElement =
      id && (!scopedContext || !scopedContextSameStore)
        ? store.setContentElement
        : null;

    props = {
      id,
      hidden,
      ...props,
      ref: useMergeRefs(setContentElement, ref, props.ref),
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
