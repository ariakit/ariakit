import {
  useEvent,
  useMergeRefs,
  useMetadataProps,
  useSafeLayoutEffect,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import {
  isButton,
  isTextField,
  fireClickEvent,
  isSelfTarget,
  queueBeforeEvent,
  disabledFromProps,
  isFirefox,
} from "@ariakit/utils";
import type { ElementType, FocusEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { withDefaultButtonType } from "../button/utils.ts";
import type { FocusableOptions } from "../focusable/focusable.tsx";
import { useFocusable } from "../focusable/focusable.tsx";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function isNativeClick(event: KeyboardEvent) {
  if (!event.isTrusted) return false;
  // istanbul ignore next: can't test trusted events yet
  const element = event.currentTarget;
  if (event.key === "Enter") {
    return (
      isButton(element) ||
      element.tagName === "SUMMARY" ||
      element.tagName === "A"
    );
  }
  if (event.key === " ") {
    return (
      isButton(element) ||
      element.tagName === "SUMMARY" ||
      element.tagName === "INPUT" ||
      element.tagName === "SELECT"
    );
  }
  return false;
}

const symbol = Symbol("command");

/**
 * Returns props to create a `Command` component. If the element is not a native
 * clickable element (like a button), this hook will return additional props to
 * make sure it's accessible.
 * @see https://ariakit.com/components/command
 * @example
 * ```jsx
 * const props = useCommand({ render: <div /> });
 * <Role {...props}>Accessible button</Role>
 * ```
 */
export const useCommand = createHook<TagName, CommandOptions>(
  function useCommand({ clickOnEnter = true, clickOnSpace = true, ...props }) {
    const ref = useRef<HTMLType>(null);
    const [isNativeButton, setIsNativeButton] = useState(false);
    const type = props.type;

    useEffect(() => {
      const element = ref.current;
      if (!element) return;
      const nativeButton = isButton(element);
      // React 19's useFormStatus relies on the post-mount render below for
      // native submit controls. A native type="button" control already has the
      // same type that Command would apply, so updating state would only
      // schedule a redundant render.
      if (type !== undefined && nativeButton && element.type === "button")
        return;
      setIsNativeButton(nativeButton);
    }, [type]);

    const [active, setActive] = useState(false);
    const activeRef = useRef(false);
    const disabled = disabledFromProps(props);
    const [isDuplicate, metadataProps] = useMetadataProps(props, symbol, true);

    // When the element becomes disabled while it's in the active ("pressed")
    // state — for example, it disables itself on the Space keydown — the keyup
    // that clears the state in `onKeyUp` below may never reach it: a non-native
    // element that turns disabled loses its focusability, so the browser moves
    // focus to the body and delivers the keyup there instead. Clear the state
    // here too so the element doesn't stay stuck looking pressed. This runs as a
    // layout effect so the active state is gone before paint, avoiding a frame
    // where the element renders as both pressed and disabled.
    useSafeLayoutEffect(() => {
      if (!disabled) return;
      activeRef.current = false;
      setActive(false);
    }, [disabled]);

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
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
    });

    const onKeyUpProp = props.onKeyUp;

    const onKeyUp = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyUpProp?.(event);

      if (isDuplicate) return;

      const isSpace = clickOnSpace && event.key === " ";
      if (!activeRef.current || !isSpace) return;

      const nativeClick = isNativeClick(event);

      // Clear the active state as soon as Space is released, before all the
      // guards below (defaultPrevented, self-target, disabled, metaKey), so a
      // short-circuited keyup (a consumer calling preventDefault, Meta still
      // held on release, or the element becoming disabled between keydown and
      // keyup) can't leave the element stuck in a visually "pressed" state.
      // Firing the synthetic click is still gated by those guards.
      activeRef.current = false;
      if (!nativeClick) {
        setActive(false);
      }

      if (event.defaultPrevented) return;
      // The keydown only sets the pressed state when self-targeted, so a keyup
      // bubbling from a child (focus moved into the child mid-press) must not
      // dispatch a synthetic click on this element.
      if (!isSelfTarget(event)) return;
      if (disabled) return;
      if (event.metaKey) return;
      if (nativeClick) return;

      event.preventDefault();
      const element = event.currentTarget;
      const { view, ...eventInit } = event;
      queueMicrotask(() => fireClickEvent(element, eventInit));
    });

    const onBlurProp = props.onBlur;

    // If focus moves away while Space is held, the keyup is delivered to the
    // new focus target and `onKeyUp` above never runs. Clear the pressed state
    // so the element doesn't stay stuck looking pressed, mirroring how native
    // buttons cancel the Space activation when they lose focus before the
    // keyup. Focus moving into a descendant also cancels the press, so a keyup
    // bubbling up from a child can't reinstate it.
    const onBlur = useEvent((event: FocusEvent<HTMLType>) => {
      onBlurProp?.(event);
      if (!activeRef.current) return;
      activeRef.current = false;
      setActive(false);
    });

    props = {
      "data-active": active || undefined,
      type: isNativeButton ? "button" : undefined,
      ...metadataProps,
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onKeyDown,
      onKeyUp,
      onBlur,
    };

    props = useFocusable<TagName>(props);

    return props;
  },
);

/**
 * Renders a clickable element, which is a `button` by default, and inherits
 * features from the [`Focusable`](https://ariakit.com/reference/focusable)
 * component.
 *
 * If the base element isn't a native clickable one, this component will provide
 * extra attributes and event handlers to ensure accessibility. It can be
 * activated with the keyboard using the
 * [`clickOnEnter`](https://ariakit.com/reference/command#clickonenter) and
 * [`clickOnSpace`](https://ariakit.com/reference/command#clickonspace)
 * props. Both are set to `true` by default.
 * @see https://ariakit.com/components/command
 * @example
 * ```jsx
 * <Command>Button</Command>
 * ```
 */
export const Command = forwardRef(function Command(props: CommandProps) {
  const htmlProps = useCommand(withDefaultButtonType(props));
  return createElement(TagName, htmlProps);
});

export interface CommandOptions<
  T extends ElementType = TagName,
> extends FocusableOptions<T> {
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

export type CommandProps<T extends ElementType = TagName> = Props<
  T,
  CommandOptions<T>
>;
