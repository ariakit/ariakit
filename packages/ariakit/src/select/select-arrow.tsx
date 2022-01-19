import { useMemo } from "react";
import { BasePlacement } from "@popperjs/core";
import { useStore } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { SelectContext } from "./__utils";
import { SelectState } from "./select-state";

const pointsMap = {
  top: "4,10 8,6 12,10",
  right: "6,4 10,8 6,12",
  bottom: "4,6 8,10 12,6",
  left: "10,4 6,8 10,12",
};

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow pointing to the select popover position.
 * It's usually rendered inside the `Select` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const state = useSelectState();
 * const props = useSelectArrow({ state });
 * <Select state={state}>
 *   {state.value}
 *   <Role {...props} />
 * </Select>
 * <SelectPopover state={state}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export const useSelectArrow = createHook<SelectArrowOptions>(
  ({ state, ...props }) => {
    state = useStore(state || SelectContext, ["placement"]);
    const dir = state?.placement.split("-")[0] as BasePlacement;
    const points = pointsMap[dir];

    const children = useMemo(
      () => (
        <svg
          display="block"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5pt"
          viewBox="0 0 16 16"
          height="1em"
          width="1em"
        >
          <polyline points={points} />
        </svg>
      ),
      [points]
    );

    props = {
      children,
      "aria-hidden": true,
      ...props,
      style: {
        width: "1em",
        height: "1em",
        pointerEvents: "none",
        ...props.style,
      },
    };

    return props;
  }
);

/**
 * A component that renders an arrow pointing to the select popover position.
 * It's usually rendered inside the `Select` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectState();
 * <Select state={select}>
 *   {select.value}
 *   <SelectArrow />
 * </Select>
 * <SelectPopover state={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export const SelectArrow = createComponent<SelectArrowOptions>((props) => {
  const htmlProps = useSelectArrow(props);
  return createElement("span", htmlProps);
});

export type SelectArrowOptions<T extends As = "span"> = Options<T> & {
  /**
   * Object returned by the `useSelectState` hook. If not provided, the parent
   * `Select` component's context will be used.
   */
  state?: SelectState;
};

export type SelectArrowProps<T extends As = "span"> = Props<
  SelectArrowOptions<T>
>;
