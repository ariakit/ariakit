import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { isSelfTarget } from "ariakit-utils/events";
import {
  useBooleanEventCallback,
  useEventCallback,
  useForkRef,
  useId,
  useRefId,
} from "ariakit-utils/hooks";
import { useStoreProvider } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, BooleanOrCallback, Props } from "ariakit-utils/types";
import { CompositeOptions, useComposite } from "../composite/composite";
import {
  CompositeTypeaheadOptions,
  useCompositeTypeahead,
} from "../composite/composite-typeahead";
import { SelectContext } from "./__utils";
import { SelectState } from "./select-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a select list.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const state = useSelectState();
 * const props = useSelectList({ state });
 * <Role {...props}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </Role>
 * ```
 */
export const useSelectList = createHook<SelectListOptions>(
  ({
    state,
    composite = true,
    resetOnEscape = true,
    hideOnEnter = true,
    focusOnMove = true,
    ...props
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const id = useId(props.id);
    const [defaultValue, setDefaultValue] = useState(state.value);

    // Stores the intial value so we can reset it later when Escape is pressed
    useEffect(() => {
      if (state.mounted) return;
      setDefaultValue(state.value);
    }, [state.mounted, state.value]);

    const onKeyDownProp = useEventCallback(props.onKeyDown);
    const resetOnEscapeProp = useBooleanEventCallback(resetOnEscape);
    const hideOnEnterProp = useBooleanEventCallback(hideOnEnter);

    const onKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDownProp(event);
        if (event.defaultPrevented) return;
        if (event.key === "Escape" && resetOnEscapeProp(event)) {
          state.setValue(defaultValue);
        }
        if (event.key === " " || event.key === "Enter") {
          if (isSelfTarget(event) && hideOnEnterProp(event)) {
            event.preventDefault();
            state.hide();
          }
        }
      },
      [
        onKeyDownProp,
        resetOnEscapeProp,
        state.setValue,
        defaultValue,
        hideOnEnterProp,
        state.hide,
      ]
    );

    props = useStoreProvider({ state, ...props }, SelectContext);

    const labelId = useRefId(state.labelRef);

    const style = state.mounted
      ? props.style
      : { ...props.style, display: "none" };

    props = {
      id,
      role: composite ? "listbox" : undefined,
      hidden: !state.mounted,
      "aria-labelledby": labelId,
      ...props,
      ref: useForkRef(id ? state.setContentElement : null, ref, props.ref),
      style,
      onKeyDown,
    };

    props = useComposite({
      state,
      ...props,
      composite,
      focusOnMove: state.visible && !state.animating && focusOnMove,
    });
    props = useCompositeTypeahead({ state, ...props });

    return props;
  }
);

/**
 * A component that renders a select list. The `role` prop is set to `listbox`
 * by default, but can be overriden by any other valid select popup role
 * (`listbox`, `menu`, `tree`, `grid` or `dialog`). The `aria-labelledby` prop
 * is set to the select input element's `id` by default.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectState();
 * <Select state={select} />
 * <SelectList state={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectList>
 * ```
 */
export const SelectList = createComponent<SelectListOptions>((props) => {
  const htmlProps = useSelectList(props);
  return createElement("div", htmlProps);
});

export type SelectListOptions<T extends As = "div"> = Omit<
  CompositeOptions<T>,
  "state"
> &
  Omit<CompositeTypeaheadOptions<T>, "state"> & {
    /**
     * Object returned by the `useSelectState` hook.
     */
    state: SelectState;
    /**
     * Whether the select value should be reset to the value before the list got
     * shown when Escape is pressed. This has effect only when the value can
     * change while the list is still visible. For example, when
     * `setValueOnClick` is set to `false` on the `SelectItem` component, or
     * `selectOnMove` is set to `true` on the select state.
     * @default true
     */
    resetOnEscape?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
    /**
     * Whether the select list should be hidden when the user presses Enter or
     * Space while the list is focused (that is, no item is selected).
     * @default true
     */
    hideOnEnter?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  };

export type SelectListProps<T extends As = "div"> = Props<SelectListOptions<T>>;
