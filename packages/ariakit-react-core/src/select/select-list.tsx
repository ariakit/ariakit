import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { isSelfTarget } from "@ariakit/core/utils/events";
import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { CompositeTypeaheadOptions } from "../composite/composite-typeahead.js";
import { useCompositeTypeahead } from "../composite/composite-typeahead.js";
import type { CompositeOptions } from "../composite/composite.js";
import { useComposite } from "../composite/composite.js";
import { isHidden } from "../disclosure/disclosure-content.js";
import type { DisclosureContentOptions } from "../disclosure/disclosure-content.js";
import {
  useAttribute,
  useBooleanEvent,
  useEvent,
  useId,
  useMergeRefs,
  useWrapElement,
} from "../utils/hooks.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { Props2 } from "../utils/types.js";
import {
  SelectScopedContextProvider,
  useSelectProviderContext,
} from "./select-context.js";
import type { SelectStore } from "./select-store.js";

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
export const useSelectList = createHook2<TagName, SelectListOptions>(
  ({
    store,
    resetOnEscape = true,
    hideOnEnter = true,
    focusOnMove = true,
    composite,
    alwaysVisible,
    ...props
  }) => {
    const context = useSelectProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "SelectList must receive a `store` prop or be wrapped in a SelectProvider component.",
    );

    const ref = useRef<HTMLDivElement>(null);
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

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLDivElement>) => {
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

    props = useWrapElement(
      props,
      (element) => (
        <SelectScopedContextProvider value={store}>
          {element}
        </SelectScopedContextProvider>
      ),
      [store],
    );

    const labelId = store.useState((state) => state.labelElement?.id);
    const hasCombobox = !!store.combobox;
    composite = composite ?? !hasCombobox;

    if (composite) {
      props = { role: "listbox", ...props };
    }

    const role = useAttribute(ref, "role", props.role);
    const isCompositeRole =
      role === "listbox" ||
      role === "menu" ||
      role === "tree" ||
      role === "grid";
    const ariaMultiSelectable =
      composite || isCompositeRole ? multiSelectable || undefined : undefined;

    const hidden = isHidden(mounted, props.hidden, alwaysVisible);
    const style = hidden ? { ...props.style, display: "none" } : props.style;

    props = {
      id,
      "aria-labelledby": labelId,
      "aria-multiselectable": ariaMultiSelectable,
      hidden,
      ...props,
      ref: useMergeRefs(id ? store.setContentElement : null, ref, props.ref),
      style,
      onKeyDown,
    };

    props = useComposite({ store, ...props, composite });
    props = useCompositeTypeahead({ store, typeahead: !hasCombobox, ...props });

    return props;
  },
);

/**
 * Renders a select list element. This is the primitive component used by the
 * [`SelectPopover`](https://ariakit.org/reference/select-popover) component.
 *
 * Unlike [`SelectPopover`](https://ariakit.org/reference/select-popover), this
 * component doesn't render a popover and therefore doesn't automatically focus
 * on items when opened.
 *
 * The `aria-labelledby` prop is set to the
 * [`Select`](https://ariakit.org/reference/select) element's `id` by default.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {3-6}
 * <SelectProvider>
 *   <Select />
 *   <SelectList>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </SelectList>
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

export type SelectListProps<T extends ElementType = TagName> = Props2<
  T,
  SelectListOptions<T>
>;
