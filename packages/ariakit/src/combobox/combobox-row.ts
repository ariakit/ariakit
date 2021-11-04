import { useContext } from "react";
import { getPopupRole } from "ariakit-utils/dom";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CompositeRowOptions,
  useCompositeRow,
} from "../composite/composite-row";
import { ComboboxContext } from "./__utils";
import { ComboboxState } from "./combobox-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a combobox row.
 * @see https://ariakit.org/docs/combobox
 * @example
 * ```jsx
 * const state = useComboboxState();
 * const props = useComboboxRow({ state });
 * <ComboboxPopover state={state}>
 *   <Role {...props}>
 *     <ComboboxItem value="Item 1" />
 *     <ComboboxItem value="Item 2" />
 *     <ComboboxItem value="Item 3" />
 *   </Role>
 * </ComboboxPopover>
 * ```
 */
export const useComboboxRow = createHook<ComboboxRowOptions>(
  ({ state, ...props }) => {
    const context = useContext(ComboboxContext);
    state = state || context;
    const popupRole = getPopupRole(state?.contentElement);
    const role = popupRole === "grid" ? "row" : "presentation";
    props = { role, ...props };
    props = useCompositeRow({ state, ...props });
    return props;
  }
);

/**
 * A component that renders a combobox row.
 * @see https://ariakit.org/docs/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxState();
 * <Combobox state={combobox} />
 * <ComboboxPopover state={combobox}>
 *   <ComboboxRow>
 *     <ComboboxItem value="Item 1.1" />
 *     <ComboboxItem value="Item 1.2" />
 *     <ComboboxItem value="Item 1.3" />
 *   </ComboboxRow>
 *   <ComboboxRow>
 *     <ComboboxItem value="Item 2.1" />
 *     <ComboboxItem value="Item 2.2" />
 *     <ComboboxItem value="Item 2.3" />
 *   </ComboboxRow>
 * </ComboboxPopover>
 * ```
 */
export const ComboboxRow = createComponent<ComboboxRowOptions>((props) => {
  const htmlProps = useComboboxRow(props);
  return createElement("div", htmlProps);
});

export type ComboboxRowOptions<T extends As = "div"> = Omit<
  CompositeRowOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useComboboxState` hook. If not provided, the parent
   * `ComboboxList` or `ComboboxPopover` components' context will be used.
   */
  state?: ComboboxState;
};

export type ComboboxRowProps<T extends As = "div"> = Props<
  ComboboxRowOptions<T>
>;
