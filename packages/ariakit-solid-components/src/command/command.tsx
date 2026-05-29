import {
  createHook,
  createInstance,
  createMetadataProps,
  createRef,
  mergeProps,
  withOptions,
} from "@ariakit/solid-utils";
import type { Props } from "@ariakit/solid-utils";
import {
  disabledFromProps,
  fireClickEvent,
  isButton,
  isFirefox,
  isSelfTarget,
  isTextField,
  queueBeforeEvent,
} from "@ariakit/utils";
import type { ValidComponent } from "solid-js";
import { createSignal, onMount, mergeProps as solidMergeProps } from "solid-js";
import type { FocusableOptions } from "../focusable/focusable.tsx";
import { useFocusable } from "../focusable/focusable.tsx";

const TagName = "button" satisfies ValidComponent;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function isNativeClick(event: KeyboardEvent) {
  if (!event.isTrusted) return false;
  // istanbul ignore next: can't test trusted events yet
  const element = event.currentTarget as HTMLType;
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

// Native DOM events don't enumerate their own properties the way React's
// synthetic events do, so a plain spread wouldn't carry the modifier state.
// We extract the relevant init properties for the dispatched click event,
// dropping the non-serializable `view` (mirroring React's `{ view, ...init }`).
function getClickEventInit(event: KeyboardEvent): PointerEventInit {
  return {
    bubbles: event.bubbles,
    cancelable: event.cancelable,
    composed: event.composed,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    metaKey: event.metaKey,
  };
}

const symbol = Symbol("command");

/**
 * Returns props to create a `Command` component. If the element is not a native
 * clickable element (like a button), this hook will return additional props to
 * make sure it's accessible.
 * @see https://solid.ariakit.com/components/command
 * @example
 * ```jsx
 * const props = useCommand({ render: <div /> });
 * <Role {...props}>Accessible button</Role>
 * ```
 */
export const useCommand = createHook<TagName, CommandOptions>(
  withOptions(
    { clickOnEnter: true, clickOnSpace: true },
    function useCommand(props, options) {
      // Stable reference to the incoming props. The returned props object below
      // is reassigned to the `props` variable, so reactive getters and event
      // handlers must read from `ownProps` to avoid self-referencing the merged
      // result. The cast exposes the metadata carrier, which is not part of
      // Solid's `HTMLAttributes` but may flow through `props`.
      const ownProps = props as typeof props & {
        _metadataProps?: { [symbol]?: boolean };
      };
      const ref = createRef<HTMLType>();
      const [isNativeButton, setIsNativeButton] = createSignal(false);

      onMount(() => {
        if (!ref.current) return;
        setIsNativeButton(isButton(ref.current));
      });

      const [active, setActive] = createSignal(false);
      const activeRef = createRef(false);
      const disabled = () => disabledFromProps(ownProps);
      const [isDuplicate, metadataProps] = createMetadataProps(
        ownProps,
        symbol,
        () => true,
      );

      const onKeyDown = (event: KeyboardEvent) => {
        const element = event.currentTarget as HTMLType;

        if (event.defaultPrevented) return;
        if (isDuplicate()) return;
        if (disabled()) return;
        if (!isSelfTarget(event)) return;
        if (isTextField(element)) return;
        if (element.isContentEditable) return;

        const isEnter = options.clickOnEnter && event.key === "Enter";
        const isSpace = options.clickOnSpace && event.key === " ";
        const shouldPreventEnter =
          event.key === "Enter" && !options.clickOnEnter;
        const shouldPreventSpace = event.key === " " && !options.clickOnSpace;

        if (shouldPreventEnter || shouldPreventSpace) {
          event.preventDefault();
          return;
        }

        if (isEnter || isSpace) {
          const nativeClick = isNativeClick(event);
          if (isEnter) {
            if (!nativeClick) {
              event.preventDefault();
              const eventInit = getClickEventInit(event);
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
            activeRef.set(true);
            if (!nativeClick) {
              event.preventDefault();
              setActive(true);
            }
          }
        }
      };

      const onKeyUp = (event: KeyboardEvent) => {
        if (event.defaultPrevented) return;
        if (isDuplicate()) return;
        if (disabled()) return;
        if (event.metaKey) return;

        const isSpace = options.clickOnSpace && event.key === " ";

        if (activeRef.current && isSpace) {
          activeRef.set(false);
          if (!isNativeClick(event)) {
            event.preventDefault();
            setActive(false);
            const element = event.currentTarget as HTMLType;
            const eventInit = getClickEventInit(event);
            queueMicrotask(() => fireClickEvent(element, eventInit));
          }
        }
      };

      // Command's overrides go in the base and the user props on top, so
      // `combineProps` chains the user's `onKeyDown`/`onKeyUp` to run first
      // (via `reverseEventHandlers`), mirroring React, which calls
      // `onKeyDownProp?.(event)`/`onKeyUpProp?.(event)` before its own logic
      // and then bails on `event.defaultPrevented`. This lets a consumer
      // cancel Command's behavior by preventing the event.
      props = mergeProps(
        {
          get "data-active"() {
            return active() || undefined;
          },
          get type() {
            return isNativeButton() ? "button" : undefined;
          },
          ref: ref.set,
          onKeyDown,
          onKeyUp,
        },
        props,
      );

      // Forward the metadata carrier as the authoritative `_metadataProps`. It's
      // a plain (non-`on*`) prop, so it survives `combineProps` composition with
      // its symbols intact (an `on*` name would be chained into a wrapper that
      // drops them). `createInstance` strips it before it reaches the DOM.
      props = solidMergeProps(props, metadataProps) as typeof props;

      props = useFocusable<TagName>(props);

      return props;
    },
  ),
);

/**
 * Renders a clickable element, which is a `button` by default, and inherits
 * features from the [`Focusable`](https://solid.ariakit.com/reference/focusable)
 * component.
 *
 * If the base element isn't a native clickable one, this component will provide
 * extra attributes and event handlers to ensure accessibility. It can be
 * activated with the keyboard using the
 * [`clickOnEnter`](https://solid.ariakit.com/reference/command#clickonenter) and
 * [`clickOnSpace`](https://solid.ariakit.com/reference/command#clickonspace)
 * props. Both are set to `true` by default.
 * @see https://solid.ariakit.com/components/command
 * @example
 * ```jsx
 * <Command>Button</Command>
 * ```
 */
export const Command = function Command(props: CommandProps) {
  const htmlProps = useCommand(props);
  return createInstance(TagName, htmlProps);
};

export interface CommandOptions<
  T extends ValidComponent = TagName,
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

export type CommandProps<T extends ValidComponent = TagName> = Props<
  T,
  CommandOptions<T>
>;
