import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  createHook,
  createComponent,
  createElement,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { isButton, isTextField } from "ariakit-utils/dom";
import {
  fireClickEvent,
  isSelfTarget,
  queueBeforeEvent,
} from "ariakit-utils/events";
import { useEventCallback, useForkRef, useTagName } from "ariakit-utils/hooks";
import { FocusableOptions, useFocusable } from "../focusable";

function isNativeClick(event: KeyboardEvent) {
  if (!event.isTrusted) return false;
  // istanbul ignore next: can't test trusted events yet
  const element = event.currentTarget;
  return (
    isButton(element) ||
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "A" ||
    element.tagName === "SELECT"
  );
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component. If the element is not a native clickable element (like a
 * button), the hook will return additional props to make sure it's accessible.
 * @see https://ariakit.org/docs/command
 * @example
 * ```jsx
 * const props = useCommand({ as: "div" });
 * <Role {...props}>Accessible button</Role>
 * ```
 */
export const useCommand = createHook<CommandOptions>(
  ({ clickOnEnter = true, clickOnSpace = true, ...props }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const tagName = useTagName(ref, props.as || "button");
    const [isNativeButton, setIsNativeButton] = useState(
      () => !!tagName && isButton({ tagName, type: props.type })
    );

    useEffect(() => {
      if (!ref.current) return;
      setIsNativeButton(isButton(ref.current));
    }, []);

    const [active, setActive] = useState(false);
    const activeRef = useRef(false);
    const isDuplicate = "data-command" in props;
    const onKeyDownProp = useEventCallback(props.onKeyDown);

    const onKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDownProp(event);
        const element = event.currentTarget;

        if (event.defaultPrevented) return;
        if (isDuplicate) return;
        if (props.disabled) return;
        if (event.metaKey) return;
        if (!isSelfTarget(event)) return;
        if (isTextField(element)) return;
        if (element.isContentEditable) return;

        const isEnter = clickOnEnter && event.key === "Enter";
        const isSpace = clickOnSpace && event.key === " ";
        const shouldPreventEnter = event.key === "Enter" && !clickOnEnter;
        const shouldPreventSpace = event.key === " " && !clickOnSpace;

        if (shouldPreventEnter || shouldPreventSpace) {
          event.preventDefault();
          return;
        }

        if (isEnter || isSpace) {
          const nativeClick = isNativeClick(event);
          if (isEnter) {
            if (!nativeClick) {
              event.preventDefault();
              const { view, ...eventInit } = event;
              queueBeforeEvent(element, "keyup", () =>
                // Fire a click event instead of calling element.click()
                // directly so we can pass the modifier state to the click
                // event.
                fireClickEvent(element, eventInit)
              );
            }
          } else if (isSpace) {
            activeRef.current = true;
            if (!nativeClick) {
              event.preventDefault();
              setActive(true);
            }
          }
        }
      },
      [onKeyDownProp, isDuplicate, props.disabled, clickOnEnter, clickOnSpace]
    );

    const onKeyUpProp = useEventCallback(props.onKeyUp);

    const onKeyUp = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyUpProp(event);

        if (event.defaultPrevented) return;
        if (isDuplicate) return;
        if (props.disabled) return;
        if (event.metaKey) return;

        const isSpace = clickOnSpace && event.key === " ";

        if (activeRef.current && isSpace) {
          activeRef.current = false;
          if (!isNativeClick(event)) {
            setActive(false);
            const element = event.currentTarget;
            const { view, ...eventInit } = event;
            requestAnimationFrame(() => fireClickEvent(element, eventInit));
          }
        }
      },
      [onKeyUpProp, isDuplicate, props.disabled, clickOnSpace]
    );

    props = {
      "data-command": "",
      "data-active": active ? "" : undefined,
      type: isNativeButton ? "button" : undefined,
      ...props,
      ref: useForkRef(ref, props.ref),
      onKeyDown,
      onKeyUp,
    };

    props = useFocusable(props);

    return props;
  }
);

/**
 * A component that renders a native clickable element (a button). If another
 * element is passed to the `as` prop, this component will make sure the
 * rendered element is accessible.
 * @see https://ariakit.org/docs/command
 * @example
 * ```jsx
 * <Command as="div">Accessible button</Command>
 * ```
 */
export const Command = createComponent<CommandOptions>((props) => {
  props = useCommand(props);
  return createElement("button", props);
});

export type CommandOptions<T extends As = "button"> = FocusableOptions<T> & {
  /**
   * If true, pressing the enter key will trigger a click on the button.
   * @default true
   */
  clickOnEnter?: boolean;
  /**
   * If true, pressing the space key will trigger a click on the button.
   * @default true
   */
  clickOnSpace?: boolean;
};

export type CommandProps<T extends As = "button"> = Props<CommandOptions<T>>;
