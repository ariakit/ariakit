import type { ElementType } from "react";
import { useContext, useMemo, useRef } from "react";
import { useMergeRefs, useTagName } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { HeadingContext } from "./heading-context.tsx";
import type { HeadingLevels } from "./utils.ts";

type HeadingElements = `h${HeadingLevels}`;
const TagName = "h1" satisfies ElementType;
type TagName = HeadingElements;
type HTMLType = HTMLElementTagNameMap[TagName];

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
export const useHeading = createHook<TagName, HeadingOptions>(
  function useHeading(props) {
    const ref = useRef<HTMLType>(null);
    const level: HeadingLevels = useContext(HeadingContext) || 1;
    const Element = `h${level}` as const;
    const tagName = useTagName(ref, Element);
    const isNativeHeading = useMemo(
      () => !!tagName && /^h\d$/.test(tagName),
      [tagName],
    );

    props = {
      render: <Element />,
      role: !isNativeHeading ? "heading" : undefined,
      "aria-level": !isNativeHeading ? level : undefined,
      ...props,
      ref: useMergeRefs(ref, props.ref),
    };

    return props;
  },
);

/**
 * Renders a heading element. The element type (or the `aria-level` attribute,
 * if the element type is not a native heading) is determined by the context
 * level provided by the closest
 * [`HeadingLevel`](https://ariakit.org/reference/heading-level) ancestor.
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
export const Heading = forwardRef(function Heading(props: HeadingProps) {
  const htmlProps = useHeading(props);
  return createElement(TagName, htmlProps);
});

export interface HeadingOptions<_T extends ElementType = TagName>
  extends Options {}

export type HeadingProps<T extends ElementType = TagName> = Props<
  T,
  HeadingOptions<T>
>;
