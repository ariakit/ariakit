import { KeyboardEvent, useRef } from "react";
import { useEvent, useForkRef, useId } from "ariakit-utils/hooks";
import { useStoreProvider } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { ComboboxContext } from "./__utils";
import { ComboboxState } from "./combobox-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a combobox list.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const state = useComboboxState();
 * const props = useComboboxList({ state });
 * <Role {...props}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </Role>
 * ```
 */
export const useComboboxList = createHook<ComboboxListOptions>(
  ({ state, ...props }) => {
    const ref = useRef<HTMLDivElement>(null);
    const id = useId(props.id);

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
        state.move(null);
      }
    });

    props = useStoreProvider({ state, ...props }, ComboboxContext);

    const style = state.mounted
      ? props.style
      : { ...props.style, display: "none" };

    props = {
      id,
      role: "listbox",
      hidden: !state.mounted,
      ...props,
      ref: useForkRef(id ? state.setContentElement : null, ref, props.ref),
      style,
      onKeyDown,
    };

    return props;
  }
);

/**
 * A component that renders a combobox list. The `role` prop is set to `listbox`
 * by default, but can be overriden by any other valid combobox popup role
 * (`listbox`, `menu`, `tree`, `grid` or `dialog`). The `aria-labelledby` prop
 * is set to the combobox input element's `id` by default.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxState();
 * <Combobox state={combobox} />
 * <ComboboxList state={combobox}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxList>
 * ```
 */
export const ComboboxList = createComponent<ComboboxListOptions>((props) => {
  const htmlProps = useComboboxList(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  ComboboxList.displayName = "ComboboxList";
}

export type ComboboxListOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `useComboboxState` hook.
   */
  state: ComboboxState;
};

export type ComboboxListProps<T extends As = "div"> = Props<
  ComboboxListOptions<T>
>;
