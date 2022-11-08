import { useContext, useMemo, useState } from "react";
import { useForkRef } from "ariakit-react-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Options, Props } from "ariakit-react-utils/types";
import { getWindow } from "ariakit-utils/dom";
import { invariant } from "ariakit-utils/misc";
import { POPOVER_ARROW_PATH } from "./__popover-arrow-path";
import { PopoverContext } from "./__store-utils";
import { PopoverStore } from "./store-popover-store";

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
  store.useSync(
    (state) => {
      if (!state.contentElement) return;
      const win = getWindow(state.contentElement);
      const computedStyle = win.getComputedStyle(state.contentElement);
      setStyle(computedStyle);
    },
    ["contentElement"]
  );
  return style;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow inside a popover element.
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
      ref: useForkRef(store?.setArrowElement, props.ref),
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
 * A component that renders an arrow inside a `Popover` component.
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

export type PopoverArrowOptions<T extends As = "div"> = Options<T> & {
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
};

export type PopoverArrowProps<T extends As = "div"> = Props<
  PopoverArrowOptions<T>
>;
