import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { isSelfTarget } from "@ariakit/core/utils/events";
import { BooleanOrCallback } from "@ariakit/core/utils/types";
import {
  CompositeTypeaheadOptions,
  useCompositeTypeahead,
} from "../composite/composite-typeahead.js";
import { CompositeOptions, useComposite } from "../composite/composite.jsx";
import {
  useBooleanEvent,
  useEvent,
  useForkRef,
  useId,
  useWrapElement,
} from "../utils/hooks.js";
import {
  createComponent,
  createElement,
  createHook,
} from "../utils/system.jsx";
import { As, Props } from "../utils/types.js";
import { SelectContext } from "./select-context.js";
import { SelectStore } from "./select-store.js";

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
export const useSelectList = createHook<SelectListOptions>(
  ({
    store,
    resetOnEscape = true,
    hideOnEnter = true,
    focusOnMove = true,
    composite = true,
    ...props
  }) => {
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
        store.setValue(defaultValue);
      }
      if (event.key === " " || event.key === "Enter") {
        if (isSelfTarget(event) && hideOnEnterProp(event)) {
          event.preventDefault();
          store.hide();
        }
      }
    });

    props = useWrapElement(
      props,
      (element) => (
        <SelectContext.Provider value={store}>{element}</SelectContext.Provider>
      ),
      [store]
    );

    const labelId = store.useState((state) => state.labelElement?.id);
    const style = mounted ? props.style : { ...props.style, display: "none" };

    if (composite) {
      props = {
        role: "listbox",
        "aria-multiselectable": multiSelectable ? true : undefined,
        ...props,
      };
    }

    props = {
      id,
      hidden: !mounted,
      "aria-labelledby": labelId,
      ...props,
      ref: useForkRef(id ? store.setContentElement : null, ref, props.ref),
      style,
      onKeyDown,
    };

    const canFocusOnMove = store.useState(
      (state) => state.open && !state.animating && focusOnMove
    );

    props = useComposite({
      store,
      ...props,
      composite,
      focusOnMove: canFocusOnMove,
    });
    props = useCompositeTypeahead({ store, ...props });

    return props;
  }
);

/**
 * Renders a select list. The `role` prop is set to `listbox` by default, but
 * can be overriden by any other valid select popup role (`listbox`, `menu`,
 * `tree`, `grid` or `dialog`). The `aria-labelledby` prop is set to the select
 * input element's `id` by default.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectStore();
 * <Select store={select} />
 * <SelectList store={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectList>
 * ```
 */
export const SelectList = createComponent<SelectListOptions>((props) => {
  const htmlProps = useSelectList(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  SelectList.displayName = "SelectList";
}

export interface SelectListOptions<T extends As = "div">
  extends CompositeOptions<T>,
    CompositeTypeaheadOptions<T> {
  /**
   * Object returned by the `useSelectStore` hook.
   */
  store: SelectStore;
  /**
   * Whether the select value should be reset to the value before the list got
   * shown when Escape is pressed. This has effect only when `selectOnMove` is
   * `true` on the select store.
   * @default true
   */
  resetOnEscape?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  /**
   * Whether the select list should be hidden when the user presses Enter or
   * Space while the list is focused (that is, no item is selected).
   * @default true
   */
  hideOnEnter?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
}

export type SelectListProps<T extends As = "div"> = Props<SelectListOptions<T>>;
