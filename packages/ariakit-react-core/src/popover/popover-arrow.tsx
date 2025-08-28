import { getWindow } from "@ariakit/core/utils/dom";
import { invariant, removeUndefinedValues } from "@ariakit/core/utils/misc";
import type { ElementType } from "react";
import { useMemo, useState } from "react";
import { useId, useMergeRefs, useSafeLayoutEffect } from "../utils/hooks.ts";
import { useStoreState } from "../utils/store.tsx";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { POPOVER_ARROW_PATH } from "./popover-arrow-path.ts";
import { usePopoverContext } from "./popover-context.tsx";
import type { PopoverStore } from "./popover-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
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
  const contentElement = useStoreState(store, "contentElement");
  useSafeLayoutEffect(() => {
    if (!contentElement) return;
    const win = getWindow(contentElement);
    const computedStyle = win.getComputedStyle(contentElement);
    setStyle(computedStyle);
  }, [contentElement]);
  return style;
}

function getRingWidth(style?: CSSStyleDeclaration) {
  if (!style) return;
  const boxShadow = style.getPropertyValue("box-shadow");
  const ringWidth = boxShadow.match(/0px 0px 0px ([^0]+px)/)?.[1];
  return ringWidth;
}

function getBorderColor(dir: BasePlacement, style?: CSSStyleDeclaration) {
  if (!style) return;
  const borderColor = style.getPropertyValue(`border-${dir}-color`);
  if (borderColor) return borderColor;
  const boxShadow = style.getPropertyValue("box-shadow");
  const match = boxShadow.match(/0px 0px 0px [^,]+/);
  if (!match) return;
  const segment = match[0];
  const ringColor = segment.replace(/^0px 0px 0px\s+[^\s,]+/, "").trim();
  return ringColor || undefined;
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
export const usePopoverArrow = createHook<TagName, PopoverArrowOptions>(
  function usePopoverArrow({
    store,
    size = defaultSize,
    borderWidth: borderWidthProp,
    ...props
  }) {
    const context = usePopoverContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "PopoverArrow must be wrapped in a Popover component.",
    );

    const dir = useStoreState(
      store,
      (state) => state.currentPlacement.split("-")[0] as BasePlacement,
    );

    const maskId = useId();
    const style = useComputedStyle(store);
    const stroke = getBorderColor(dir, style) || "none";
    const fill = style?.getPropertyValue("background-color") || "none";

    const [borderWidth, isRing] = useMemo(() => {
      if (borderWidthProp != null) return [borderWidthProp, false];
      if (!style) return [0, false];
      const ringWidth = getRingWidth(style);
      if (ringWidth) return [Number.parseInt(ringWidth, 10), true];
      const borderWidth = style.getPropertyValue(`border-${dir}-width`);
      if (borderWidth)
        return [Math.ceil(Number.parseFloat(borderWidth)), false];
      return [0, false];
    }, [borderWidthProp, style, dir]);

    const strokeWidth = borderWidth * 2 * (defaultSize / size);
    const transform = rotateMap[dir];

    const children = useMemo(
      () => (
        <svg display="block" viewBox="0 0 30 30">
          <g transform={transform}>
            {!isRing && (
              // When using the CSS border property, set the fill color to match
              // the background behind the stroke so transparent strokes match
              // the appearance of borders on HTML elements.
              <path
                fill="none"
                stroke={`var(--ak-layer, ${fill})`}
                d={POPOVER_ARROW_PATH}
                mask={`url(#${maskId})`}
              />
            )}
            <path fill="none" d={POPOVER_ARROW_PATH} mask={`url(#${maskId})`} />
            <path stroke="none" d={POPOVER_ARROW_PATH} />
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <rect
                x="-15"
                y="0"
                width="60"
                height="30"
                fill="white"
                stroke="black"
              />
            </mask>
          </g>
        </svg>
      ),
      [transform, isRing, fill, maskId],
    );

    props = {
      children,
      "aria-hidden": true,
      ...props,
      ref: useMergeRefs(store.setArrowElement, props.ref),
      style: {
        position: "absolute",
        fontSize: size,
        width: "1em",
        height: "1em",
        pointerEvents: "none",
        fill: `var(--ak-layer, ${fill})`,
        stroke: `var(--ak-layer-border, ${stroke})`,
        strokeWidth,
        ...props.style,
      },
    };

    return removeUndefinedValues(props);
  },
);

/**
 * Renders an arrow inside a [`Popover`](https://ariakit.org/reference/popover)
 * component pointing to the anchor element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx {4}
 * <PopoverProvider>
 *   <PopoverAnchor />
 *   <Popover>
 *     <PopoverArrow />
 *     Popover
 *   </Popover>
 * </PopoverProvider>
 * ```
 */
export const PopoverArrow = memo(
  forwardRef(function PopoverArrow(props: PopoverArrowProps) {
    const htmlProps = usePopoverArrow(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface PopoverArrowOptions<_T extends ElementType = TagName>
  extends Options {
  /**
   * Object returned by the
   * [`usePopoverStore`](https://ariakit.org/reference/use-popover-store) hook.
   * If not provided, the closest
   * [`Popover`](https://ariakit.org/reference/popover) or
   * [`PopoverProvider`](https://ariakit.org/reference/popover-provider)
   * components' context will be used.
   */
  store?: PopoverStore;
  /**
   * The size of the arrow.
   *
   * Live examples:
   * - [Selection Popover](https://ariakit.org/examples/popover-selection)
   * @default 30
   */
  size?: number;
  /**
   * The arrow's border width. If not specified, Ariakit will infer it from the
   * popover `contentElement`'s style.
   */
  borderWidth?: number;
}

export type PopoverArrowProps<T extends ElementType = TagName> = Props<
  T,
  PopoverArrowOptions<T>
>;
