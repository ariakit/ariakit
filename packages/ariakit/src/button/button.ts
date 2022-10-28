import { useEffect, useRef, useState } from "react";
import { useForkRef, useTagName } from "ariakit-react-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import { isButton } from "ariakit-utils/dom";
import { CommandOptions, useCommand } from "../command";

/**
 * Returns button props. If the element receiving these props is not a native
 * button, the hook will return additional props to make sure it's accessible.
 * This component hook is used by the
 * [`Button`](https://ariakit.org/apis/button) component.
 * @see https://ariakit.org/components/button
 * @example
 * ```jsx
 * const props = useButton();
 * <Role {...props}>Accessible button</Role>
 * ```
 */
export const useButton = createHook<ButtonOptions>((props) => {
  const ref = useRef<HTMLButtonElement>(null);
  const tagName = useTagName(ref, props.as || "button");
  const [isNativeButton, setIsNativeButton] = useState(
    () => !!tagName && isButton({ tagName, type: props.type })
  );

  useEffect(() => {
    if (!ref.current) return;
    setIsNativeButton(isButton(ref.current));
  }, []);

  props = {
    role: !isNativeButton && tagName !== "a" ? "button" : undefined,
    ...props,
    ref: useForkRef(ref, props.ref),
  };

  props = useCommand(props);

  return props;
});

/**
 * Renders an accessible button. If an element other than a native `button` is
 * passed to the `as` prop, this component will make sure the rendered element
 * is accessible.
 * @see https://ariakit.org/components/button
 * @example
 * ```jsx
 * <Button>Accessible button</Button>
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
