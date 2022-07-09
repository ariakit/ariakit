import { useContext, useMemo } from "react";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { PopoverContext } from "./__utils";
import { PopoverState } from "./popover-state";

type BasePlacement = "top" | "bottom" | "left" | "right";

const pointsMap = {
  top: "4,10 8,6 12,10",
  right: "6,4 10,8 6,12",
  bottom: "4,6 8,10 12,6",
  left: "10,4 6,8 10,12",
};

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow pointing to the popover position. It's
 * usually rendered inside the `PopoverDisclosure` component.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const state = usePopoverState();
 * const props = usePopoverDisclosureArrow({ state });
 * <PopoverDisclosure state={state}>
 *   Disclosure
 *   <Role {...props} />
 * </PopoverDisclosure>
 * ```
 */
export const usePopoverDisclosureArrow =
  createHook<PopoverDisclosureArrowOptions>(
    ({ state, placement, ...props }) => {
      const context = useContext(PopoverContext);
      state = state || context;
      placement = placement ?? state?.placement;
      const dir = placement?.split("-")[0] as BasePlacement;
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
 * A component that renders an arrow pointing to the popover position. It's
 * usually rendered inside the `PopoverDisclosure` component.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const popover = usePopoverState();
 * <PopoverDisclosure state={popover}>
 *   Disclosure
 *   <PopoverDisclosureArrow />
 * </PopoverDisclosure>
 * <Popover state={popover}>Popover</Popover>
 * ```
 */
export const PopoverDisclosureArrow =
  createComponent<PopoverDisclosureArrowOptions>((props) => {
    const htmlProps = usePopoverDisclosureArrow(props);
    return createElement("span", htmlProps);
  });

export type PopoverDisclosureArrowOptions<T extends As = "span"> =
  Options<T> & {
    /**
     * Object returned by the `usePopoverState` hook. If not provided, the
     * parent `PopoverDisclosure` component's context will be used.
     */
    state?: PopoverState;
    /**
     * TODO: Comment.
     */
    placement?: PopoverState["placement"];
  };

export type PopoverDisclosureArrowProps<T extends As = "span"> = Props<
  PopoverDisclosureArrowOptions<T>
>;
