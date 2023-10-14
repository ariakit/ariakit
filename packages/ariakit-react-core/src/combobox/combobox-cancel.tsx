"use client";
import type { MouseEvent } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { ButtonOptions } from "../button/button.js";
import { useButton } from "../button/button.js";
import { useEvent } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useComboboxProviderContext } from "./combobox-context.js";
import type { ComboboxStore } from "./combobox-store.js";

const children = (
  <svg
    aria-hidden="true"
    display="block"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1pt"
    width="1em"
    height="1em"
    pointerEvents="none"
  >
    <line x1="5" y1="5" x2="11" y2="11" />
    <line x1="5" y1="11" x2="11" y2="5" />
  </svg>
);

/**
 * Returns props to create a `ComboboxCancel` component that clears the combobox
 * input when clicked.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxCancel({ store });
 * <Combobox store={store} />
 * <Role {...props} />
 * ```
 */
export const useComboboxCancel = createHook<ComboboxCancelOptions>(
  ({ store, ...props }) => {
    const context = useComboboxProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxCancel must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      store?.setValue("");
      // Move focus to the combobox input.
      store?.move(null);
    });

    const comboboxId = store.useState((state) => state.baseElement?.id);

    props = {
      children,
      "aria-label": "Clear input",
      // This aria-controls will ensure the combobox popup remains visible when
      // this element gets focused. This logic is done in the ComboboxPopover
      // component.
      "aria-controls": comboboxId,
      ...props,
      onClick,
    };

    props = useButton(props);

    return props;
  },
);

/**
 * Renders a combobox cancel button that clears the combobox input when clicked.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxCancel />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxCancel = createComponent<ComboboxCancelOptions>(
  (props) => {
    const htmlProps = useComboboxCancel(props);
    return createElement("button", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  ComboboxCancel.displayName = "ComboboxCancel";
}

export interface ComboboxCancelOptions<T extends As = "button">
  extends ButtonOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxCancelProps<T extends As = "button"> = Props<
  ComboboxCancelOptions<T>
>;
