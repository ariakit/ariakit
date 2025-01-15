import {
  type ValidComponent,
  createMemo,
  createSignal,
  useContext,
} from "solid-js";
import { extractTagName, mergeProps } from "../utils/misc.ts";
import { createHook, createInstance } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { HeadingContext } from "./heading-context.tsx";
import type { HeadingLevels } from "./utils.ts";

type HeadingElements = `h${HeadingLevels}`;
const TagName = "h1" satisfies ValidComponent;
type TagName = HeadingElements;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `Heading` component. The element type (or the
 * `aria-level` prop, if the element type is not a native heading) is determined
 * by the context level provided by the parent `HeadingLevel` component.
 * @see https://solid.ariakit.org/components/heading
 * @example
 * ```jsx
 * const props = useHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export const useHeading = createHook<TagName, HeadingOptions>(
  function useHeading(props) {
    // [port]: we use a signal instead of a ref so that `extractTagName` will
    // take effect reactively, even though it doesn't use an effect like in the
    // original version.
    const [ref, setRef] = createSignal<HTMLType>();
    const level = () => useContext(HeadingContext)() || 1;
    const Element = () => `h${level()}` as const;
    const tagName = () => extractTagName(ref(), Element());
    const isNativeHeading = createMemo(
      () => !!tagName() && /^h\d$/.test(tagName()!),
    );

    props = mergeProps(
      {
        render: Element(),
        $role: () => (!isNativeHeading() ? "heading" : undefined),
        "$aria-level": () => (!isNativeHeading() ? level() : undefined),
        ref: setRef,
      },
      props,
    );

    return props;
  },
);

/**
 * Renders a heading element. The element type (or the `aria-level` attribute,
 * if the element type is not a native heading) is determined by the context
 * level provided by the closest
 * [`HeadingLevel`](https://solid.ariakit.org/reference/heading-level) ancestor.
 * @see https://solid.ariakit.org/components/heading
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
export const Heading = function Heading(props: HeadingProps) {
  const htmlProps = useHeading(props);
  return createInstance(TagName, htmlProps);
};

export interface HeadingOptions<_T extends ValidComponent = TagName>
  extends Options {}

export type HeadingProps<T extends ValidComponent = TagName> = Props<
  T,
  HeadingOptions<T>
>;
