import { isSelfTarget } from "@ariakit/core/utils/events";
import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { ElementType, KeyboardEvent } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import { useComposite } from "../composite/composite.tsx";
import type { CompositeTypeaheadOptions } from "../composite/composite-typeahead.tsx";
import { useCompositeTypeahead } from "../composite/composite-typeahead.tsx";
import type { DisclosureContentOptions } from "../disclosure/disclosure-content.tsx";
import { isHidden } from "../disclosure/disclosure-content.tsx";
import {
  useAttribute,
  useBooleanEvent,
  useEvent,
  useId,
  useMergeRefs,
  useTransactionState,
  useWrapElement,
} from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import {
  SelectHeadingContext,
  SelectScopedContextProvider,
  useSelectContext,
} from "./select-context.tsx";
import type { SelectStore } from "./select-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

const SelectListContext = createContext<
  ((store: SelectStore | null) => void) | null
>(null);

/**
 * Returns props to create a `SelectList` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectList({ store });
 * <Role {...props}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </Role>
 * ```
 */
export const useSelectList = createHook<TagName, SelectListOptions>(
  function useSelectList({
    store,
    resetOnEscape = true,
    hideOnEnter = true,
    focusOnMove = true,
    composite,
    alwaysVisible,
    ...props
  }) {
    const context = useSelectContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "SelectList must receive a `store` prop or be wrapped in a SelectProvider component.",
    );

    const id = useId(props.id);
    const value = store.useState("value");
    const multiSelectable = Array.isArray(value);
    const [defaultValue, setDefaultValue] = useState(value);

    const mounted = store.useState("mounted");

    // Stores the intial value so we can reset it later when Escape is pressed
    useEffect(() => {
      if (mounted) return;
      setDefaultValue(value);
    }, [mounted, value]);

    resetOnEscape = resetOnEscape && !multiSelectable;

    const onKeyDownProp = props.onKeyDown;
    const resetOnEscapeProp = useBooleanEvent(resetOnEscape);
    const hideOnEnterProp = useBooleanEvent(hideOnEnter);

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "Escape" && resetOnEscapeProp(event)) {
        store?.setValue(defaultValue);
      }
      if (event.key === " " || event.key === "Enter") {
        if (isSelfTarget(event) && hideOnEnterProp(event)) {
          event.preventDefault();
          store?.hide();
        }
      }
    });

    const headingContext = useContext(SelectHeadingContext);
    const headingState = useState<string>();
    const [headingId, setHeadingId] = headingContext || headingState;

    const headingContextValue: typeof headingState = useMemo(
      () => [headingId, setHeadingId],
      [headingId],
    );

    const [childStore, setChildStore] = useState<SelectStore | null>(null);
    const setStore = useContext(SelectListContext);

    useEffect(() => {
      if (!setStore) return;
      setStore(store);
      return () => setStore(null);
    }, [setStore, store]);

    props = useWrapElement(
      props,
      (element) => (
        <SelectScopedContextProvider value={store}>
          <SelectListContext.Provider value={setChildStore}>
            <SelectHeadingContext.Provider value={headingContextValue}>
              {element}
            </SelectHeadingContext.Provider>
          </SelectListContext.Provider>
        </SelectScopedContextProvider>
      ),
      [store, headingContextValue],
    );

    const hasCombobox = !!store.combobox;
    composite = composite ?? (!hasCombobox && childStore !== store);

    const [element, setElement] = useTransactionState(
      composite ? store.setListElement : null,
    );

    const role = useAttribute(element, "role", props.role);
    const isCompositeRole =
      role === "listbox" ||
      role === "menu" ||
      role === "tree" ||
      role === "grid";
    const ariaMultiSelectable =
      composite || isCompositeRole ? multiSelectable || undefined : undefined;

    const hidden = isHidden(mounted, props.hidden, alwaysVisible);
    const style = hidden ? { ...props.style, display: "none" } : props.style;

    if (composite) {
      props = {
        role: "listbox",
        "aria-multiselectable": ariaMultiSelectable,
        ...props,
      };
    }

    const labelId = store.useState(
      (state) => headingId || state.labelElement?.id,
    );

    props = {
      id,
      "aria-labelledby": labelId,
      hidden,
      ...props,
      ref: useMergeRefs(setElement, props.ref),
      style,
      onKeyDown,
    };

    props = useComposite({ store, ...props, composite });
    props = useCompositeTypeahead({ store, typeahead: !hasCombobox, ...props });

    return props;
  },
);

/**
 * Renders a wrapper for
 * [`SelectItem`](https://ariakit.org/reference/select-item) elements. This
 * component may be rendered within a
 * [`SelectPopover`](https://ariakit.org/reference/select-popover) component if
 * there are other non-item elements inside the popover.
 *
 * The `aria-labelledby` prop is set to the
 * [`Select`](https://ariakit.org/reference/select) element's `id` by default.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {5-8}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectDismiss />
 *     <SelectList>
 *       <SelectItem value="Apple" />
 *       <SelectItem value="Orange" />
 *     </SelectList>
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export const SelectList = forwardRef(function SelectList(
  props: SelectListProps,
) {
  const htmlProps = useSelectList(props);
  return createElement(TagName, htmlProps);
});

export interface SelectListOptions<T extends ElementType = TagName>
  extends CompositeOptions<T>,
    CompositeTypeaheadOptions<T>,
    Pick<DisclosureContentOptions, "alwaysVisible"> {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook. If
   * not provided, the closest
   * [`SelectProvider`](https://ariakit.org/reference/select-provider)
   * component's context will be used.
   */
  store?: SelectStore;
  /**
   * Whether the select value should be reset to the value before the list got
   * shown when Escape is pressed. This has effect only when
   * [`setValueOnMove`](https://ariakit.org/reference/select-provider#setvalueonmove)
   * is `true`.
   * @default true
   */
  resetOnEscape?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  /**
   * Whether the [`SelectList`](https://ariakit.org/reference/select-list) or
   * [`SelectPopover`](https://ariakit.org/reference/select-popover) components
   * should be hidden when the user presses Enter or Space while the list
   * element is focused and no item is active.
   * @default true
   */
  hideOnEnter?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
}

export type SelectListProps<T extends ElementType = TagName> = Props<
  T,
  SelectListOptions<T>
>;
