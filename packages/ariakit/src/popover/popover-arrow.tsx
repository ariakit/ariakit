import { useContext, useMemo, useState } from "react";
import { BasePlacement } from "@popperjs/core";
import { getWindow } from "ariakit-utils/dom";
import { useForkRef, useSafeLayoutEffect } from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { POPOVER_ARROW_PATH } from "./__popover-arrow-path";
import { PopoverContext } from "./__utils";
import { PopoverState } from "./popover-state";

const rotateMap = {
  top: "rotate(180 0 0)",
  right: "rotate(-90 0 0)",
  bottom: "rotate(0 0 0)",
  left: "rotate(90 0 0)",
};

const defaultSize = 30;

function useComputedStyle(element?: Element | null) {
  const [style, setStyle] = useState<CSSStyleDeclaration>();
  useSafeLayoutEffect(() => {
    if (!element) return;
    const computedStyle = getWindow(element).getComputedStyle(element);
    setStyle(computedStyle);
  }, [element]);
  return style;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow inside a popover element.
 * @see https://ariakit.org/docs/popover
 * @example
 * ```jsx
 * const state = usePopoverState();
 * const props = usePopoverArrow({ state });
 * <Popover state={state}>
 *   <Role {...props} />
 *   Popover
 * </Popover>
 * ```
 */
export const usePopoverArrow = createHook<PopoverArrowOptions>(
  ({ state, size = defaultSize, ...props }) => {
    const context = useContext(PopoverContext);
    state = state || context;

    const dir = state?.currentPlacement.split("-")[0] as BasePlacement;
    const style = useComputedStyle(state?.contentElement);
    const fill = style?.getPropertyValue("background-color") || "none";
    const stroke = style?.getPropertyValue(`border-${dir}-color`) || "none";
    const borderWidth = style?.getPropertyValue(`border-${dir}-width`) || "0px";
    const strokeWidth = parseInt(borderWidth) * 2 * (defaultSize / size);
    const transform = rotateMap[dir];

    const children = useMemo(
      () => (
        <svg display="block" transform={transform} viewBox="0 0 30 30">
          <path fill="none" d={POPOVER_ARROW_PATH} />
          <path stroke="none" d={POPOVER_ARROW_PATH} />
        </svg>
      ),
      [transform]
    );

    props = {
      children,
      "aria-hidden": true,
      ...props,
      ref: useForkRef(state?.arrowRef, props.ref),
      style: {
        fontSize: size,
        width: "1em",
        height: "1em",
        pointerEvents: "none",
        fill,
        stroke,
        strokeWidth,
        ...props.style,
      },
    };

    return props;
  }
);

/**
 * A component that renders an arrow inside a `Popover` component.
 * @see https://ariakit.org/docs/popover
 * @example
 * ```jsx
 * const popover = usePopoverState();
 * <Popover state={popover}>
 *   <PopoverArrow />
 *   Popover
 * </Popover>
 * ```
 */
export const PopoverArrow = createComponent<PopoverArrowOptions>((props) => {
  const htmlProps = usePopoverArrow(props);
  return createElement("div", htmlProps);
});

export type PopoverArrowOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `usePopoverState` hook. If not provided, the parent
   * `Popover` component's context will be used.
   */
  state?: PopoverState;
  /**
   * The size of the arrow.
   * @default 30
   */
  size?: number;
};

export type PopoverArrowProps<T extends As = "div"> = Props<
  PopoverArrowOptions<T>
>;
