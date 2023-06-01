import { useContext, useMemo, useState } from "react";
import { getWindow } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import { useMergeRefs, useSafeLayoutEffect } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";
import { POPOVER_ARROW_PATH } from "./popover-arrow-path.js";
import { PopoverContext } from "./popover-context.js";
import type { PopoverStore } from "./popover-store.js";

type BasePlacement = "top" | "bottom" | "left" | "right";

const defaultSize = 30;
const halfDefaultSize = defaultSize / 2;

const rotateMap = {
  top: `rotate(180 ${halfDefaultSize} ${halfDefaultSize})`,
  right: `rotate(-90 ${halfDefaultSize} ${halfDefaultSize})`,
  bottom: `rotate(0 ${halfDefaultSize} ${halfDefaultSize})`,
  left: `rotate(90 ${halfDefaultSize} ${halfDefaultSize})`,
};

function useComputedStyle(store: PopoverStore) {
  const [style, setStyle] = useState<CSSStyleDeclaration>();
  const contentElement = store.useState("contentElement");
  useSafeLayoutEffect(() => {
    if (!contentElement) return;
    const win = getWindow(contentElement);
    const computedStyle = win.getComputedStyle(contentElement);
    setStyle(computedStyle);
  }, [contentElement]);
  return style;
}

/**
 * Returns props to create a `PopoverArrow` component.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const store = usePopoverStore();
 * const props = usePopoverArrow({ store });
 * <Popover store={store}>
 *   <Role {...props} />
 *   Popover
 * </Popover>
 * ```
 */
export const usePopoverArrow = createHook<PopoverArrowOptions>(
  ({ store, size = defaultSize, ...props }) => {
    const context = useContext(PopoverContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "PopoverArrow must be wrapped in a Popover component"
    );

    const dir = store.useState(
      (state) => state.currentPlacement.split("-")[0] as BasePlacement
    );

    const style = useComputedStyle(store);
    const fill = style?.getPropertyValue("background-color") || "none";
    const stroke = style?.getPropertyValue(`border-${dir}-color`) || "none";
    const borderWidth = style?.getPropertyValue(`border-${dir}-width`) || "0px";
    const strokeWidth = parseInt(borderWidth) * 2 * (defaultSize / size);
    const transform = rotateMap[dir];

    const children = useMemo(
      () => (
        <svg display="block" viewBox="0 0 30 30">
          <g transform={transform}>
            <path fill="none" d={POPOVER_ARROW_PATH} />
            <path stroke="none" d={POPOVER_ARROW_PATH} />
          </g>
        </svg>
      ),
      [transform]
    );

    props = {
      children,
      "aria-hidden": true,
      ...props,
      ref: useMergeRefs(store.setArrowElement, props.ref),
      style: {
        // server side rendering
        position: "absolute",
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
 * Renders an arrow inside a `Popover` component.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const popover = usePopoverStore();
 * <Popover store={popover}>
 *   <PopoverArrow />
 *   Popover
 * </Popover>
 * ```
 */
export const PopoverArrow = createComponent<PopoverArrowOptions>((props) => {
  const htmlProps = usePopoverArrow(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  PopoverArrow.displayName = "PopoverArrow";
}

export interface PopoverArrowOptions<T extends As = "div"> extends Options<T> {
  /**
   * Object returned by the `usePopoverStore` hook. If not provided, the parent
   * `Popover` component's context will be used.
   */
  store?: PopoverStore;
  /**
   * The size of the arrow.
   * @default 30
   */
  size?: number;
}

export type PopoverArrowProps<T extends As = "div"> = Props<
  PopoverArrowOptions<T>
>;
