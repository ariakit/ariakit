import { useContext, useMemo } from "react";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Options, Props } from "ariakit-react-utils/types";
import { invariant } from "ariakit-utils/misc";
import { PopoverContext } from "./__store-utils";
import { PopoverStore, PopoverStoreState } from "./store-popover-store";

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
 * const store = usePopoverStore();
 * const props = usePopoverDisclosureArrow({ store });
 * <PopoverDisclosure store={store}>
 *   Disclosure
 *   <Role {...props} />
 * </PopoverDisclosure>
 * ```
 */
export const usePopoverDisclosureArrow =
  createHook<PopoverDisclosureArrowOptions>(
    ({ store, placement, ...props }) => {
      const context = useContext(PopoverContext);
      store = store || context;

      invariant(
        store,
        process.env.NODE_ENV !== "production" &&
          "PopoverDisclosureArrow must be wrapped in a PopoverDisclosure component"
      );

      const dir = store.useState((state) => {
        const position = placement || state.placement;
        return position.split("-")[0] as BasePlacement;
      });
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
 * const popover = usePopoverStore();
 * <PopoverDisclosure store={popover}>
 *   Disclosure
 *   <PopoverDisclosureArrow />
 * </PopoverDisclosure>
 * <Popover store={popover}>Popover</Popover>
 * ```
 */
export const PopoverDisclosureArrow =
  createComponent<PopoverDisclosureArrowOptions>((props) => {
    const htmlProps = usePopoverDisclosureArrow(props);
    return createElement("span", htmlProps);
  });

if (process.env.NODE_ENV !== "production") {
  PopoverDisclosureArrow.displayName = "PopoverDisclosureArrow";
}

export type PopoverDisclosureArrowOptions<T extends As = "span"> =
  Options<T> & {
    /**
     * Object returned by the `usePopoverStore` hook. If not provided, the
     * parent `PopoverDisclosure` component's context will be used.
     */
    store?: PopoverStore;
    /**
     * Placement to which the arrow should point. If not provided, the parent
     * `PopoverDisclosure` component's context will be used.
     */
    placement?: PopoverStoreState["placement"];
  };

export type PopoverDisclosureArrowProps<T extends As = "span"> = Props<
  PopoverDisclosureArrowOptions<T>
>;
