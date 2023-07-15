import { useEffect, useRef, useState } from "react";
import { isButton } from "@ariakit/core/utils/dom";
import type { CommandOptions } from "../command/command.js";
import { useCommand } from "../command/command.js";
import { useMergeRefs, useTagName } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";

/**
 * Returns props to create a `Button` component. If the element is not a native
 * button, the hook will return additional props to make sure it's accessible.
 * @see https://ariakit.org/components/button
 * @example
 * ```jsx
 * const props = useButton({ render: <div /> });
 * <Role {...props}>Accessible button</Role>
 * ```
 */
export const useButton = createHook<ButtonOptions>((props) => {
  const ref = useRef<HTMLButtonElement>(null);
  const tagName = useTagName(ref, props.as || "button");
  const [isNativeButton, setIsNativeButton] = useState(
    () => !!tagName && isButton({ tagName, type: props.type }),
  );

  useEffect(() => {
    if (!ref.current) return;
    setIsNativeButton(isButton(ref.current));
  }, []);

  props = {
    role: !isNativeButton && tagName !== "a" ? "button" : undefined,
    ...props,
    ref: useMergeRefs(ref, props.ref),
  };

  props = useCommand(props);

  return props;
});

/**
 * Renders an accessible button element. If the underlying element is not a
 * native button, this component will pass additional attributes to make sure
 * it's accessible.
 * @see https://ariakit.org/components/button
 * @example
 * ```jsx
 * <Button render={<div />}>Accessible button</Button>
 * ```
 */
export const Button = createComponent<ButtonOptions>((props) => {
  const htmlProps = useButton(props);
  return createElement("button", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Button.displayName = "Button";
}

export type ButtonOptions<T extends As = "button"> = CommandOptions<T>;

export type ButtonProps<T extends As = "button"> = Props<ButtonOptions<T>>;
