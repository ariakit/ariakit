import { useStoreState } from "@ariakit/react-store";
import {
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
  createElement,
  createHook,
  forwardRef,
  memo,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import { getWindow, invariant } from "@ariakit/utils";
import type { ElementType } from "react";
import { useMemo, useState } from "react";
import { getBasePlacement } from "./__utils.ts";
import { POPOVER_ARROW_PATH } from "./popover-arrow-path.ts";
import { usePopoverContext } from "./popover-context.tsx";
import type { PopoverStore } from "./popover-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

const defaultSize = 30;
const halfDefaultSize = defaultSize / 2;

const rotateMap = {
  top: `rotate(180 ${halfDefaultSize} ${halfDefaultSize})`,
  right: `rotate(-90 ${halfDefaultSize} ${halfDefaultSize})`,
  bottom: `rotate(0 ${halfDefaultSize} ${halfDefaultSize})`,
  left: `rotate(90 ${halfDefaultSize} ${halfDefaultSize})`,
};

type BasePlacement = ReturnType<typeof getBasePlacement>;

interface RingStyle {
  width: number;
  color?: string;
}

/**
 * Replaces every character inside parentheses with a space so length matching
 * and comma splitting can't pick up numbers or commas that belong to color
 * functions such as `rgb()` or `oklch()`, while preserving character indices
 * into the original text.
 */
function maskParentheses(text: string) {
  let masked = "";
  let depth = 0;
  for (const char of text) {
    if (char === "(") {
      depth += 1;
      masked += char;
      continue;
    }
    if (char === ")") {
      depth = Math.max(0, depth - 1);
      masked += char;
      continue;
    }
    masked += depth > 0 ? " " : char;
  }
  return masked;
}

// Matches a ring-style length run: zero x/y offsets and blur followed by a
// positive spread. Computed styles serialize all lengths with px units, but
// declared values (which some test environments return from getComputedStyle)
// may keep unitless zeros, so both forms are accepted.
const ringLengthsRegex =
  /(?:^|\s)0(?:px)?\s+0(?:px)?\s+0(?:px)?\s+((?:\d*\.)?\d+)px(?=\s|$)/;

function getRingFromSegment(segment: string, maskedSegment: string) {
  const match = maskedSegment.match(ringLengthsRegex);
  if (!match) return;
  const spread = match[1];
  if (!spread) return;
  const width = Number.parseFloat(spread);
  // Zero-spread segments are placeholders (for example, Tailwind v3 rings
  // always output disabled ring offset shadows), not rings.
  if (!width) return;
  const lengthsStart = match.index ?? 0;
  const lengthsEnd = lengthsStart + match[0].length;
  // Whatever remains of the segment once the length run and the optional inset
  // keyword are removed is the ring color. This works regardless of the color
  // syntax and of whether the browser serializes the color before or after the
  // lengths.
  const rest = `${segment.slice(0, lengthsStart)} ${segment.slice(lengthsEnd)}`;
  const color = rest.replace(/\binset\b/g, " ").trim();
  const ring: RingStyle = { width, color: color || undefined };
  return ring;
}

/**
 * Finds the first box-shadow segment that draws a ring (zero offsets and blur
 * with a positive spread, as produced by Tailwind ring utilities) and returns
 * its width and color.
 */
function getRing(style: CSSStyleDeclaration) {
  const boxShadow = style.getPropertyValue("box-shadow");
  if (!boxShadow) return;
  if (boxShadow === "none") return;
  const masked = maskParentheses(boxShadow);
  let segmentStart = 0;
  // Split on top-level commas only: colors such as rgb(59, 130, 246) contain
  // commas of their own, but those are masked out above.
  for (let index = 0; index <= masked.length; index += 1) {
    if (index !== masked.length && masked[index] !== ",") continue;
    const ring = getRingFromSegment(
      boxShadow.slice(segmentStart, index),
      masked.slice(segmentStart, index),
    );
    if (ring) return ring;
    segmentStart = index + 1;
  }
  return;
}

interface ArrowStyle {
  fill: string;
  stroke: string;
  borderWidth: number;
  isRing: boolean;
}

interface GetArrowStyleParams {
  style: CSSStyleDeclaration;
  dir: BasePlacement;
  borderWidthProp?: number;
}

/**
 * Derives the arrow's fill, stroke and stroke mode from the popover's computed
 * style.
 */
function getArrowStyle({
  style,
  dir,
  borderWidthProp,
}: GetArrowStyleParams): ArrowStyle {
  const fill = style.getPropertyValue("background-color") || "none";
  // Without a ring, the stroke takes the border color, which always resolves to
  // a concrete value on connected elements (currentColor at the very least).
  const borderColor = style.getPropertyValue(`border-${dir}-color`) || "none";
  if (borderWidthProp != null) {
    return {
      fill,
      stroke: borderColor,
      borderWidth: borderWidthProp,
      isRing: false,
    };
  }
  const ring = getRing(style);
  if (ring) {
    // When the popover is outlined by a ring, the arrow stroke must match the
    // ring color so the arrow blends into the outline. A ring segment with an
    // omitted color defaults to currentColor per CSS, so use the computed text
    // color then. Computed styles always serialize a concrete shadow color, but
    // declared values returned by some test environments may omit it.
    const stroke = ring.color || style.getPropertyValue("color") || "none";
    // Math.ceil matches the border width fallback below so fractional ring
    // widths still render a visible stroke on high-DPI screens.
    return { fill, stroke, borderWidth: Math.ceil(ring.width), isRing: true };
  }
  const parsed = Number.parseFloat(
    style.getPropertyValue(`border-${dir}-width`),
  );
  const borderWidth = Number.isNaN(parsed) ? 0 : Math.ceil(parsed);
  return { fill, stroke: borderColor, borderWidth, isRing: false };
}

interface UseArrowStyleParams {
  store: PopoverStore;
  dir: BasePlacement;
  borderWidthProp?: number;
}

function useArrowStyle({ store, dir, borderWidthProp }: UseArrowStyleParams) {
  const [arrowStyle, setArrowStyle] = useState<ArrowStyle>();
  const contentElement = useStoreState(store, "contentElement");
  const open = useStoreState(store, "open");
  // The popover colors can change while it's closed, for example after a theme
  // switch, without re-rendering the arrow. The open state is a dependency so
  // the computed style is read again every time the popover opens.
  useSafeLayoutEffect(() => {
    if (!contentElement) return;
    const win = getWindow(contentElement);
    const style = win.getComputedStyle(contentElement);
    setArrowStyle(getArrowStyle({ style, dir, borderWidthProp }));
  }, [contentElement, open, dir, borderWidthProp]);
  return arrowStyle;
}

/**
 * Returns props to create a `PopoverArrow` component.
 * @see https://ariakit.com/components/popover
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

    const dir = useStoreState(store, ["currentPlacement"], (state) =>
      getBasePlacement(state.currentPlacement),
    );

    const maskId = useId();
    const arrowStyle = useArrowStyle({ store, dir, borderWidthProp });
    const fill = arrowStyle?.fill ?? "none";
    const stroke = arrowStyle?.stroke ?? "none";
    const isRing = arrowStyle?.isRing ?? false;
    const borderWidth = arrowStyle?.borderWidth ?? borderWidthProp ?? 0;

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
                stroke={fill}
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
        fill,
        stroke,
        strokeWidth,
        ...props.style,
      },
    };

    return props;
  },
);

/**
 * Renders an arrow inside a [`Popover`](https://ariakit.com/reference/popover)
 * component pointing to the anchor element.
 * @see https://ariakit.com/components/popover
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

export interface PopoverArrowOptions<
  _T extends ElementType = TagName,
> extends Options {
  /**
   * Object returned by the
   * [`usePopoverStore`](https://ariakit.com/reference/use-popover-store) hook.
   * If not provided, the closest
   * [`Popover`](https://ariakit.com/reference/popover) or
   * [`PopoverProvider`](https://ariakit.com/reference/popover-provider)
   * components' context will be used.
   */
  store?: PopoverStore;
  /**
   * The size of the arrow.
   *
   * Live examples:
   * - [Selection Popover](https://ariakit.com/examples/popover-selection)
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
