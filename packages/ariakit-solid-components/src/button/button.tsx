import {
  createHook,
  createInstance,
  createRef,
  extractTagName,
  mergeProps,
} from "@ariakit/solid-utils";
import type { Props } from "@ariakit/solid-utils";
import { isButton } from "@ariakit/utils";
import type { ValidComponent } from "solid-js";
import { createMemo } from "solid-js";
import type { CommandOptions } from "../command/command.tsx";
import { useCommand } from "../command/command.tsx";

const TagName = "button" satisfies ValidComponent;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `Button` component. If the element is not a native
 * button, the hook will return additional props to make sure it's accessible.
 * @see https://solid.ariakit.com/components/button
 * @example
 * ```jsx
 * const props = useButton({ render: <div /> });
 * <Role {...props}>Accessible button</Role>
 * ```
 */
export const useButton = createHook<TagName, ButtonOptions>(
  function useButton(props) {
    const ref = createRef<HTMLType>();
    const tagName = extractTagName(ref.get, TagName);
    // Prefer the real element once mounted, falling back to a guess based on
    // the rendered tag name and `type` prop before the element exists. This
    // mirrors React's two-phase `isNativeButton` (lazy initial state +
    // post-mount correction) without a deferred effect.
    const isNativeButton = createMemo(() => {
      const element = ref.current;
      if (element) return isButton(element);
      const tag = tagName();
      return !!tag && isButton({ tagName: tag, type: props.type });
    });

    props = mergeProps(
      {
        get role() {
          return !isNativeButton() && tagName() !== "a" ? "button" : undefined;
        },
        ref: ref.set,
      },
      props,
    );

    props = useCommand(props);

    return props;
  },
);

/**
 * Renders an accessible button element. If the underlying element is not a
 * native button, this component will pass additional attributes to make sure
 * it's accessible.
 * @see https://solid.ariakit.com/components/button
 * @example
 * ```jsx
 * <Button>Button</Button>
 * ```
 */
export const Button = function Button(props: ButtonProps) {
  const htmlProps = useButton(props);
  return createInstance(TagName, htmlProps);
};

export interface ButtonOptions<
  T extends ValidComponent = TagName,
> extends CommandOptions<T> {}

export type ButtonProps<T extends ValidComponent = TagName> = Props<
  T,
  ButtonOptions<T>
>;
