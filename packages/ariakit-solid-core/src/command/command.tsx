import { isButton, isTextField } from "@ariakit/core/utils/dom";
import {
  fireClickEvent,
  isSelfTarget,
  queueBeforeEvent,
} from "@ariakit/core/utils/events";
import { disabledFromProps } from "@ariakit/core/utils/misc";
import { isFirefox } from "@ariakit/core/utils/platform";
import {
  type JSX,
  type ValidComponent,
  createEffect,
  createSignal,
} from "solid-js";
import { createRef, extractMetadataProps, mergeProps } from "../utils/misc.ts";
import { createHook, createInstance } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";

const TagName = "button" satisfies ValidComponent;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function isNativeClick(event: KeyboardEvent) {
  if (!event.isTrusted) return false;
  // istanbul ignore next: can't test trusted events yet
  const element = event.currentTarget;
  if (event.key === "Enter") {
    return (
      element !== null &&
      element instanceof HTMLElement &&
      (isButton(element) ||
        element.tagName === "SUMMARY" ||
        element.tagName === "A")
    );
  }
  if (event.key === " ") {
    return (
      element !== null &&
      element instanceof HTMLElement &&
      (isButton(element) ||
        element.tagName === "SUMMARY" ||
        element.tagName === "INPUT" ||
        element.tagName === "SELECT")
    );
  }
  return false;
}

const symbol = Symbol("command");

/**
 * Returns props to create a `Command` component. If the element is not a native
 * clickable element (like a button), this hook will return additional props to
 * make sure it's accessible.
 * @see https://solid.ariakit.org/components/command
 * @example
 * ```jsx
 * const props = useCommand({ render: <div /> });
 * <Role {...props}>Accessible button</Role>
 * ```
 */
export const useCommand = createHook<TagName, CommandOptions>(
  function useCommand({ clickOnEnter = true, clickOnSpace = true, ...props }) {
    const ref = createRef<HTMLType>();
    const [isNativeButton, setIsNativeButton] = createSignal(false);

    createEffect(() => {
      if (!ref.current) return;
      setIsNativeButton(isButton(ref.current));
    });

    const [active, setActive] = createSignal(false);
    const activeRef = createRef(false);
    const disabled = disabledFromProps(props);
    const [isDuplicate, metadataProps] = extractMetadataProps(
      props,
      symbol,
      true,
    );

    const onKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (
      event,
    ) => {
      const element = event.currentTarget;

      if (event.defaultPrevented) return;
      if (isDuplicate) return;
      if (disabled) return;
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
            // Fire a click event instead of calling element.click() directly so
            // we can pass along the modifier state.
            const click = () => fireClickEvent(element, eventInit);
            // If this element is a link with target="_blank", Firefox will
            // block the "popup" if the click event is dispatched synchronously
            // or in a microtask. Queueing the event asynchronously fixes that.
            if (isFirefox()) {
              queueBeforeEvent(element, "keyup", click);
            } else {
              queueMicrotask(click);
            }
          }
        } else if (isSpace) {
          activeRef.current = true;
          if (!nativeClick) {
            event.preventDefault();
            setActive(true);
          }
        }
      }
    };

    const onKeyUp: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (
      event,
    ) => {
      if (event.defaultPrevented) return;
      if (isDuplicate) return;
      if (disabled) return;
      if (event.metaKey) return;

      const isSpace = clickOnSpace && event.key === " ";

      if (activeRef.current && isSpace) {
        activeRef.current = false;
        if (!isNativeClick(event)) {
          event.preventDefault();
          setActive(false);
          const element = event.currentTarget;
          const { view, ...eventInit } = event;
          queueMicrotask(() => fireClickEvent(element, eventInit));
        }
      }
    };

    props = {
      "data-active": active() ? "true" : "false",
      type: isNativeButton() ? "button" : undefined,
      ...metadataProps,
      ...props,
      ...mergeProps(
        {
          ref: ref.bind,
          onKeyDown,
          onKeyUp,
        },
        props,
      ),
    };

    // TODO: Add useFocusable when it's available
    // props = useFocusable<TagName>(props);

    return props;
  },
);

/**
 * Renders a clickable element, which is a `button` by default, and inherits
 * features from the [`Focusable`](https://ariakit.org/reference/focusable)
 * component.
 *
 * If the base element isn't a native clickable one, this component will provide
 * extra attributes and event handlers to ensure accessibility. It can be
 * activated with the keyboard using the
 * [`clickOnEnter`](https://solid.ariakit.org/reference/command#clickonenter) and
 * [`clickOnSpace`](https://solid.ariakit.org/reference/command#clickonspace)
 * props. Both are set to `true` by default.
 * @see https://solid.ariakit.org/components/command
 * @example
 * ```jsx
 * <Command>Button</Command>
 * ```
 */
export const Command = function Command(props: CommandProps) {
  const htmlProps = useCommand(props);
  return createInstance(TagName, htmlProps);
};

// TODO: Extends FocusableOptions when it's available
export interface CommandOptions extends Options {
  /**
   * If set to `true`, pressing the enter key while this element is focused will
   * trigger a click on the element, regardless of whether it's a native button
   * or not. If this prop is set to `false`, pressing enter will not initiate a
   * click.
   * @default true
   */
  clickOnEnter?: boolean;
  /**
   * If set to `true`, pressing and releasing the space key while this element
   * is focused will trigger a click on the element, regardless of whether it's
   * a native button or not. If this prop is set to `false`, space will not
   * initiate a click.
   * @default true
   */
  clickOnSpace?: boolean;
}

export type CommandProps<T extends ValidComponent = TagName> = Props<
  T,
  CommandOptions
>;
