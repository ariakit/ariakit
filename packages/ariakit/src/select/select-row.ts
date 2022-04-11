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
import { SelectContext } from "./__utils";
import { SelectState } from "./select-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a select row.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const state = useSelectState();
 * const props = useSelectRow({ state });
 * <SelectPopover state={state}>
 *   <Role {...props}>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </Role>
 * </SelectPopover>
 * ```
 */
export const useSelectRow = createHook<SelectRowOptions>(
  ({ state, ...props }) => {
    const context = useContext(SelectContext);
    state = state || context;
    const popupRole = getPopupRole(state?.contentElement);
    const role = popupRole === "grid" ? "row" : "presentation";
    props = { role, ...props };
    props = useCompositeRow({ state, ...props });
    return props;
  }
);

/**
 * A component that renders a select row.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectState();
 * <Select state={select} />
 * <SelectPopover state={select}>
 *   <SelectRow>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </SelectRow>
 *   <SelectRow>
 *     <SelectItem value="Banana" />
 *     <SelectItem value="Grape" />
 *   </SelectRow>
 * </SelectPopover>
 * ```
 */
export const SelectRow = createComponent<SelectRowOptions>((props) => {
  const htmlProps = useSelectRow(props);
  return createElement("div", htmlProps);
});

export type SelectRowOptions<T extends As = "div"> = Omit<
  CompositeRowOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useSelectState` hook. If not provided, the parent
   * `SelectList` or `SelectPopover` components' context will be used.
   */
  state?: SelectState;
};

export type SelectRowProps<T extends As = "div"> = Props<SelectRowOptions<T>>;
