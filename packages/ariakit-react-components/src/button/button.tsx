import {
  useMergeRefs,
  useTagName,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { isButton } from "@ariakit/utils";
import type { ElementType } from "react";
import { useEffect, useRef, useState } from "react";
import type { CommandOptions } from "../command/command.tsx";
import { useCommand } from "../command/command.tsx";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `Button` component. If the element is not a native
 * button, the hook will return additional props to make sure it's accessible.
 * @see https://ariakit.com/components/button
 * @example
 * ```jsx
 * const props = useButton({ render: <div /> });
 * <Role {...props}>Accessible button</Role>
 * ```
 */
export const useButton = createHook<TagName, ButtonOptions>(
  function useButton(props) {
    const ref = useRef<HTMLType>(null);
    // Pass the render hint so host element swaps resolve the tag name in the
    // same render. For Button, this makes the anchor check below immediate on
    // swaps to render={<a />}, and seeds the isNativeButton initial state
    // correctly on the first render (including SSR) when the render prop is a
    // non-button host element. See
    // https://github.com/ariakit/ariakit/issues/6336
    const tagName = useTagName(ref, TagName, props.render);
    const [isNativeButton, setIsNativeButton] = useState(
      () => !!tagName && isButton({ tagName, type: props.type }),
    );

    // No dependency array so the check re-runs on every render: the render
    // prop can swap the underlying DOM node without remounting the component.
    // The equality guard skips the state update entirely in the steady state —
    // scheduling even a bailed-out update on every commit trips React 18's
    // synchronous work loop. See
    // https://github.com/ariakit/ariakit/issues/6336
    // oxlint-disable-next-line exhaustive-deps
    useEffect(() => {
      if (!ref.current) return;
      const nextIsNativeButton = isButton(ref.current);
      if (nextIsNativeButton === isNativeButton) return;
      setIsNativeButton(nextIsNativeButton);
    });

    props = {
      role: !isNativeButton && tagName !== "a" ? "button" : undefined,
      ...props,
      ref: useMergeRefs(ref, props.ref),
    };

    props = useCommand(props);

    return props;
  },
);

/**
 * Renders an accessible button element. If the underlying element is not a
 * native button, this component will pass additional attributes to make sure
 * it's accessible.
 * @see https://ariakit.com/components/button
 * @example
 * ```jsx
 * <Button>Button</Button>
 * ```
 */
export const Button = forwardRef(function Button(props: ButtonProps) {
  const htmlProps = useButton(props);
  return createElement(TagName, htmlProps);
});

export interface ButtonOptions<
  T extends ElementType = TagName,
> extends CommandOptions<T> {}

export type ButtonProps<T extends ElementType = TagName> = Props<
  T,
  ButtonOptions<T>
>;
