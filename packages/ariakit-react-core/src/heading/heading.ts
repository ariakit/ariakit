import { useContext, useMemo, useRef } from "react";
import { useForkRef, useTagName } from "../utils/hooks";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Options, Props } from "../utils/types";
import { HeadingContext } from "./heading-context";
import { HeadingLevels } from "./utils";

type HeadingElements = `h${HeadingLevels}`;

/**
 * Returns props to create a `Heading` component. The element type (or the
 * `aria-level` prop, if the element type is not a native heading) is determined
 * by the context level provided by the parent `HeadingLevel` component.
 * @see https://ariakit.org/components/heading
 * @example
 * ```jsx
 * const props = useHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export const useHeading = createHook<HeadingOptions>((props) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const level: HeadingLevels = useContext(HeadingContext) || 1;
  const as = `h${level}` as const;
  const tagName = useTagName(ref, props.as || as);
  const isNativeHeading = useMemo(
    () => !!tagName && /^h\d$/.test(tagName),
    [tagName]
  );

  props = {
    as,
    role: !isNativeHeading ? "heading" : undefined,
    "aria-level": !isNativeHeading ? level : undefined,
    ...props,
    ref: useForkRef(ref, props.ref),
  };

  return props;
});

/**
 * Renders a heading element. The element type (or the `aria-level` prop, if the
 * element type is not a native heading) is determined by the context level
 * provided by the parent `HeadingLevel` component.
 * @see https://ariakit.org/components/heading
 * @example
 * ```jsx
 * <HeadingLevel>
 *   <Heading>Heading 1</Heading>
 *   <HeadingLevel>
 *     <Heading>Heading 2</Heading>
 *   </HeadingLevel>
 * </HeadingLevel>
 * ```
 */
export const Heading = createComponent<HeadingOptions>((props) => {
  const htmlProps = useHeading(props);
  return createElement("h1", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Heading.displayName = "Heading";
}

export type HeadingOptions<T extends As = HeadingElements> = Options<T>;

export type HeadingProps<T extends As = HeadingElements> = Props<
  HeadingOptions<T>
>;
