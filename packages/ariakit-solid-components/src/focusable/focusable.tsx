import {
  createHook,
  createInstance,
  createMetadataProps,
  createRef,
  extractTagName,
  mergeProps,
  withOptions,
} from "@ariakit/solid-utils";
import type { Options, Props } from "@ariakit/solid-utils";
import {
  addGlobalEventListener,
  disabledFromProps,
  hasFocus,
  isFocusable,
  isFocusEventOutside,
  isSafari,
  isSelfTarget,
  queueBeforeEvent,
} from "@ariakit/utils";
import type { BivariantCallback } from "@ariakit/utils";
import type { JSX, ValidComponent } from "solid-js";
import {
  createEffect,
  createMemo,
  createSignal,
  mergeProps as solidMergeProps,
  onCleanup,
  useContext,
} from "solid-js";
import { FocusableContext } from "./focusable-context.tsx";

const TagName = "div" satisfies ValidComponent;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

const accessibleWhenDisabledSymbol = Symbol("accessibleWhenDisabled");

const isSafariBrowser = isSafari();

const alwaysFocusVisibleInputTypes = [
  "text",
  "search",
  "url",
  "tel",
  "email",
  "password",
  "number",
  "date",
  "month",
  "week",
  "time",
  "datetime",
  "datetime-local",
];

function isAlwaysFocusVisible(element: HTMLElement) {
  const { tagName, readOnly, type } = element as HTMLInputElement;
  if (tagName === "TEXTAREA" && !readOnly) return true;
  if (tagName === "SELECT" && !readOnly) return true;
  if (tagName === "INPUT" && !readOnly) {
    return alwaysFocusVisibleInputTypes.includes(type);
  }
  if (element.isContentEditable) return true;
  // Take into account custom Ariakit Select within a form.
  const role = element.getAttribute("role");
  if (role === "combobox" && element.dataset.name) {
    return true;
  }
  return false;
}

function isNativeTabbable(tagName?: string) {
  if (!tagName) return true;
  return (
    tagName === "button" ||
    tagName === "summary" ||
    tagName === "input" ||
    tagName === "select" ||
    tagName === "textarea" ||
    tagName === "a"
  );
}

function supportsDisabledAttribute(tagName?: string) {
  if (!tagName) return true;
  return (
    tagName === "button" ||
    tagName === "input" ||
    tagName === "select" ||
    tagName === "textarea"
  );
}

interface GetTabIndexParams {
  focusable: boolean;
  trulyDisabled: boolean;
  nativeTabbable: boolean;
  supportsDisabled: boolean;
  safariTabIndex: boolean;
  tabIndexProp?: number;
}

const buttonInputTypes = [
  "button",
  "color",
  "file",
  "image",
  "reset",
  "submit",
];

function needsSafariTabIndex(tagName?: string, inputType?: string) {
  if (tagName === "button") return true;
  if (tagName === "input" && inputType) {
    if (inputType === "checkbox" || inputType === "radio") return true;
    return buttonInputTypes.includes(inputType);
  }
  return false;
}

function isNativeSubmitControl(element: HTMLElement) {
  if (element.tagName === "BUTTON") {
    const { type } = element as HTMLButtonElement;
    return type === "submit";
  }
  if (element.tagName === "INPUT") {
    const { type } = element as HTMLInputElement;
    return type === "submit" || type === "image";
  }
  return false;
}

function getTabIndex({
  focusable,
  trulyDisabled,
  nativeTabbable,
  supportsDisabled,
  safariTabIndex,
  tabIndexProp,
}: GetTabIndexParams) {
  if (!focusable) return tabIndexProp;
  if (trulyDisabled) {
    if (nativeTabbable && !supportsDisabled) {
      // Anchor, audio and video tags don't support the `disabled` attribute.
      // We must pass tabIndex={-1} so they don't receive focus on tab.
      return -1;
    }
    // Elements that support the `disabled` attribute don't need tabIndex.
    return;
  }
  if (nativeTabbable) {
    // On Safari, buttons and button-like inputs (checkboxes, radios, submit,
    // reset, etc.) require an explicit tabIndex to receive focus on mousedown.
    if (safariTabIndex && tabIndexProp == null) {
      return 0;
    }
    return tabIndexProp;
  }
  // If the element is enabled and is not natively tabbable, we have to
  // fallback tabIndex={0}.
  return tabIndexProp ?? 0;
}

let hasInstalledGlobalEventListeners = false;

// isKeyboardModality should be true by default.
let isKeyboardModality = true;

function onGlobalMouseDown(event: MouseEvent) {
  const target = event.target as HTMLElement | EventTarget | null;
  if (target && "hasAttribute" in target) {
    // If the target element is already focus-visible, we keep the keyboard
    // modality.
    if (!target.hasAttribute("data-focus-visible")) {
      isKeyboardModality = false;
    }
  }
}

function onGlobalKeyDown(event: KeyboardEvent) {
  if (event.metaKey) return;
  if (event.ctrlKey) return;
  if (event.altKey) return;
  isKeyboardModality = true;
}

/**
 * Returns props to create a `Focusable` component.
 * @see https://solid.ariakit.com/components/focusable
 * @example
 * ```jsx
 * const props = useFocusable();
 * <Role {...props}>Focusable</Role>
 * ```
 */
export const useFocusable = createHook<TagName, FocusableOptions>(
  withOptions(
    {
      focusable: true,
      accessibleWhenDisabled: undefined,
      autoFocus: undefined,
      onFocusVisible: undefined,
    },
    function useFocusable(props, options) {
      // Stable reference to the incoming props. The returned props object below
      // is reassigned to the `props` variable, so reactive getters and event
      // handlers must read from `ownProps` to avoid self-referencing the merged
      // result (which would recurse). The cast exposes the React-style capture
      // props and the metadata carrier, which are not part of Solid's
      // `HTMLAttributes` but may flow through `props`.
      const ownProps = props as typeof props & {
        _metadataProps?: { [accessibleWhenDisabledSymbol]?: any };
        onKeyDownCapture?: (event: KeyboardEvent) => void;
        onFocusCapture?: (event: FocusEvent) => void;
        onBlur?: (event: FocusEvent) => void;
        onKeyPressCapture?: (event: Event) => void;
        onClickCapture?: (event: Event) => void;
        onMouseDownCapture?: (event: Event) => void;
      };
      const ref = createRef<HTMLType>();
      const [parentAccessibleWhenDisabled, metadataProps] = createMetadataProps(
        ownProps,
        accessibleWhenDisabledSymbol,
        () => options.accessibleWhenDisabled,
      );
      const accessibleWhenDisabled = () =>
        options.accessibleWhenDisabled ?? parentAccessibleWhenDisabled();

      // Add global event listeners to determine whether the user is using a
      // keyboard to navigate the site or not.
      createEffect(() => {
        if (!options.focusable) return;
        if (hasInstalledGlobalEventListeners) return;
        addGlobalEventListener("mousedown", onGlobalMouseDown, true);
        addGlobalEventListener("keydown", onGlobalKeyDown, true);
        hasInstalledGlobalEventListeners = true;
      });

      const disabled = () => options.focusable && disabledFromProps(ownProps);
      const trulyDisabled = () => disabled() && !accessibleWhenDisabled();
      const [focusVisible, setFocusVisible] = createSignal(false);
      const focusVisibleRef = createRef(false);
      const nativeSubmitObserverCleanupRef = createRef<(() => void) | null>(
        null,
      );
      const cleanupFocusVisible = (element: HTMLElement | null | undefined) => {
        nativeSubmitObserverCleanupRef.current?.();
        nativeSubmitObserverCleanupRef.set(null);
        focusVisibleRef.set(false);
        element?.removeAttribute("data-focus-visible");
      };

      // When the focusable element is disabled, it doesn't trigger a blur event
      // so we can't set focusVisible to false there. Instead, we have to do it
      // here by checking the element's disabled attribute.
      createEffect(() => {
        if (!options.focusable) return;
        if (!trulyDisabled()) return;
        cleanupFocusVisible(ref.current);
        if (focusVisible()) {
          setFocusVisible(false);
        }
      });

      // When an element that has focus becomes hidden, it doesn't trigger a
      // blur event so we can't set focusVisible to false there. We observe the
      // element and check if it's still focusable. Otherwise, we set
      // focusVisible to false.
      createEffect(() => {
        if (!options.focusable) return;
        if (!focusVisible()) return;
        const element = ref.current;
        if (!element) return;
        if (typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver(() => {
          if (!isFocusable(element)) {
            focusVisibleRef.set(false);
            setFocusVisible(false);
          }
        });
        observer.observe(element);
        onCleanup(() => observer.disconnect());
      });

      onCleanup(() => nativeSubmitObserverCleanupRef.current?.());

      // Disable events when the element is disabled.
      const disableEvent = (
        onEvent: ((event: Event) => void) | undefined,
        event: Event,
      ) => {
        onEvent?.(event);
        if (event.defaultPrevented) return;
        if (disabled()) {
          event.stopPropagation();
          event.preventDefault();
        }
      };

      const handleFocusVisible = (event: Event, currentTarget?: HTMLType) => {
        if (currentTarget) {
          // Native DOM events have a read-only `currentTarget` that is reset to
          // null after dispatch, so we redefine it to point at the element that
          // was captured when the handler was queued. This keeps it available
          // to `onFocusVisible` consumers.
          Object.defineProperty(event, "currentTarget", {
            configurable: true,
            get: () => currentTarget,
          });
        }
        if (!options.focusable) return;
        const element = (currentTarget ?? event.currentTarget) as HTMLType;
        if (!element) return;
        // Some extensions like 1password dispatches some keydown events on
        // autofill and immediately moves focus to the next field. That's why we
        // need to check if the current element is still focused.
        if (!hasFocus(element)) return;
        options.onFocusVisible?.(event);
        if (event.defaultPrevented) return;
        // Make sure data-focus-visible is applied visually at the same time as
        // other data attributes like data-active-item. See
        // https://github.com/ariakit/ariakit/issues/4083
        element.dataset.focusVisible = "true";
        focusVisibleRef.set(true);
        // React 19's useFormStatus may lose the pending state when local
        // component state changes while a native submit control is pending.
        if (isNativeSubmitControl(element)) {
          nativeSubmitObserverCleanupRef.current?.();
          nativeSubmitObserverCleanupRef.set(null);
          if (typeof IntersectionObserver !== "undefined") {
            const observer = new IntersectionObserver(() => {
              if (isFocusable(element)) return;
              cleanupFocusVisible(element);
            });
            observer.observe(element);
            // The setter treats a bare function as an updater, so we return the
            // cleanup callback from the updater form.
            nativeSubmitObserverCleanupRef.set(
              () => () => observer.disconnect(),
            );
          }
          return;
        }
        setFocusVisible(true);
      };

      const onKeyDownCapture = (event: KeyboardEvent) => {
        ownProps.onKeyDownCapture?.(event);
        if (event.defaultPrevented) return;
        if (!options.focusable) return;
        if (focusVisible()) return;
        if (focusVisibleRef.current) return;
        if (event.metaKey) return;
        if (event.altKey) return;
        if (event.ctrlKey) return;
        if (!isSelfTarget(event)) return;
        const element = event.currentTarget as HTMLType;
        const applyFocusVisible = () => handleFocusVisible(event, element);
        queueBeforeEvent(element, "focusout", applyFocusVisible);
      };

      const onFocusCapture = (event: FocusEvent) => {
        ownProps.onFocusCapture?.(event);
        if (event.defaultPrevented) return;
        if (!options.focusable) return;
        if (!isSelfTarget(event)) {
          setFocusVisible(false);
          return;
        }
        const element = event.currentTarget as HTMLType;
        const applyFocusVisible = () => handleFocusVisible(event, element);
        if (
          isKeyboardModality ||
          isAlwaysFocusVisible(event.target as HTMLElement)
        ) {
          queueBeforeEvent(
            event.target as HTMLElement,
            "focusout",
            applyFocusVisible,
          );
        } else {
          setFocusVisible(false);
        }
      };

      // Note: Can't use onBlurCapture here otherwise it will not work with
      // CompositeItem's with the virtualFocus state set to true.
      const onBlur = (event: FocusEvent) => {
        if (!options.focusable) return;
        if (!isFocusEventOutside(event)) return;
        // Since we set the data-focus-visible attribute on the element in the
        // handleFocusVisible function, we remove it directly here. Otherwise,
        // the attribute might not be removed on lower-end devices.
        cleanupFocusVisible(event.currentTarget as HTMLElement);
        setFocusVisible(false);
      };

      const autoFocusOnShow = useContext(FocusableContext);

      // The native autoFocus prop is problematic in many ways. For example,
      // when an element has the native autofocus attribute, the focus event
      // will be triggered before effects (even layout effects) and before refs
      // are assigned. This means we won't have access to the element's ref or
      // anything else that's set up by effects on the onFocus event. So we
      // don't pass the autoFocus prop to the element and instead manually focus
      // the element when it's mounted. The order in which this effect runs also
      // matters. See
      // https://x.com/diegohaz/status/1408180632933388289
      const autoFocusRef = (element: HTMLElement | null) => {
        if (!options.focusable) return;
        if (!options.autoFocus) return;
        if (!element) return;
        if (!autoFocusOnShow()) return;
        // We have to queue focus so other effects and refs can be applied
        // first. See select-animated example.
        queueMicrotask(() => {
          if (hasFocus(element)) return;
          if (!isFocusable(element)) return;
          element.focus();
        });
      };

      const tagName = extractTagName(ref.get);
      const nativeTabbable = () =>
        options.focusable && isNativeTabbable(tagName());
      const supportsDisabled = () =>
        options.focusable && supportsDisabledAttribute(tagName());

      // On Safari, buttons and button-like inputs don't receive focus on
      // mousedown. We detect this from the DOM element (not props) so it works
      // with render={<input type="submit" />} and custom components.
      const [safariTabIndex, setSafariTabIndex] = createSignal(false);

      if (isSafariBrowser) {
        createEffect(() => {
          if (!options.focusable) return;
          const element = ref.current;
          if (!element) return;
          const tag = element.tagName.toLowerCase();
          const type = (element as HTMLInputElement).type;
          setSafariTabIndex(needsSafariTabIndex(tag, type));
        });
      }

      // When truly disabled, prevent pointer events. The user's `style` is
      // merged on top automatically by `mergeProps`/`combineProps` (via
      // `combineStyle`), so we only provide the disabled override here.
      const style = createMemo<JSX.CSSProperties | undefined>(() =>
        trulyDisabled() ? { "pointer-events": "none" } : undefined,
      );

      // Data attributes default beneath the user props.
      props = mergeProps(
        {
          get "data-focus-visible"() {
            return (options.focusable && focusVisible()) || undefined;
          },
          get "data-autofocus"() {
            return options.autoFocus || undefined;
          },
          get "aria-disabled"() {
            return disabled() || undefined;
          },
        },
        props,
      );

      // Overrides above the user props.
      props = mergeProps(
        {
          ref: (element: HTMLType) => {
            ref.set(element);
            autoFocusRef(element);
          },
          get style() {
            return style();
          },
          get tabIndex() {
            return getTabIndex({
              focusable: options.focusable,
              trulyDisabled: trulyDisabled(),
              nativeTabbable: nativeTabbable(),
              supportsDisabled: supportsDisabled(),
              safariTabIndex: safariTabIndex(),
              tabIndexProp: ownProps.tabIndex as number | undefined,
            });
          },
          get disabled() {
            return supportsDisabled() && trulyDisabled() ? true : undefined;
          },
          // TODO: Test Focusable contentEditable.
          get contentEditable() {
            return disabled() ? undefined : ownProps.contentEditable;
          },
          "on:keypress": {
            capture: true,
            handleEvent: (event: Event) =>
              disableEvent(ownProps.onKeyPressCapture, event),
          },
          "on:click": {
            capture: true,
            handleEvent: (event: Event) =>
              disableEvent(ownProps.onClickCapture, event),
          },
          "on:mousedown": {
            capture: true,
            handleEvent: (event: Event) =>
              disableEvent(ownProps.onMouseDownCapture, event),
          },
          "on:keydown": { capture: true, handleEvent: onKeyDownCapture },
          "on:focus": { capture: true, handleEvent: onFocusCapture },
          // `mergeProps` chains `on*` handlers, so the user's `onBlur` is
          // invoked automatically (it runs first via `reverseEventHandlers`).
          onBlur,
        },
        props,
        // Strip the user's raw versions of the props the override above
        // computes, so the computed getters are the sole source. Otherwise,
        // since plain keys resolve last-non-undefined-wins, an override getter
        // returning `undefined` would fall through to the user's value
        // (mirroring React, which places the override above `...props` and then
        // calls `removeUndefinedValues`):
        // - `disabled`/`tabIndex`/`contentEditable` are dropped on disabled
        //   elements; the user's raw value must not resurface.
        // - the React-style `on*Capture` handlers are already captured into the
        //   `on:*` capture handlers above; their raw names would otherwise leak
        //   to the DOM (React overwrites them by key, so they never reach it).
        [
          "disabled",
          "tabIndex",
          "contentEditable",
          "onKeyDownCapture",
          "onFocusCapture",
          "onKeyPressCapture",
          "onClickCapture",
          "onMouseDownCapture",
        ] as Array<keyof typeof props>,
      );

      // Forward the metadata carrier as the authoritative `_metadataProps`. It's
      // a plain (non-`on*`) prop, so it survives `combineProps` composition with
      // its symbols intact (an `on*` name would be chained into a wrapper that
      // drops them). `createInstance` strips it before it reaches the DOM.
      props = solidMergeProps(props, metadataProps) as typeof props;

      return props;
    },
  ),
);

/**
 * Renders a focusable element. When this element gains keyboard focus, it gets
 * a
 * [`data-focus-visible`](https://solid.ariakit.com/guide/styling#data-focus-visible)
 * attribute and triggers the
 * [`onFocusVisible`](https://solid.ariakit.com/reference/focusable#onfocusvisible)
 * prop.
 *
 * The `Focusable` component supports the
 * [`disabled`](https://solid.ariakit.com/reference/focusable#disabled) prop for
 * all elements, even those not supporting the native `disabled` attribute.
 * Disabled elements using the `Focusable` component may be still accessible via
 * keyboard by using the the
 * [`accessibleWhenDisabled`](https://solid.ariakit.com/reference/focusable#accessiblewhendisabled)
 * prop.
 * @see https://solid.ariakit.com/components/focusable
 * @example
 * ```jsx
 * <Focusable>Focusable</Focusable>
 * ```
 */
export const Focusable = function Focusable(props: FocusableProps) {
  const htmlProps = useFocusable(props);
  return createInstance(TagName, htmlProps);
};

export interface FocusableOptions<
  _T extends ValidComponent = TagName,
> extends Options {
  /**
   * Determines if the element is disabled. This sets the `aria-disabled`
   * attribute accordingly, enabling support for all elements, including those
   * that don't support the native `disabled` attribute.
   *
   * This feature can be combined with the
   * [`accessibleWhenDisabled`](https://solid.ariakit.com/reference/focusable#accessiblewhendisabled)
   * prop to make disabled elements still accessible via keyboard.
   *
   * **Note**: For this prop to work, the
   * [`focusable`](https://solid.ariakit.com/reference/command#focusable) prop
   * must be set to `true`, if it's not set by default.
   *
   * Live examples:
   * - [Submenu](https://solid.ariakit.com/examples/menu-nested)
   * - [Combobox with Tabs](https://solid.ariakit.com/examples/combobox-tabs)
   * - [Context Menu](https://solid.ariakit.com/examples/menu-context-menu)
   * @default false
   */
  disabled?: boolean;
  /**
   * Automatically focuses the element upon mounting, similar to the native
   * `autoFocus` prop. This addresses an issue where the element with the native
   * `autoFocus` attribute might receive focus before effects are executed.
   *
   * The `autoFocus` prop can also be used with
   * [Focusable](https://solid.ariakit.com/components/focusable) elements within
   * a [Dialog](https://solid.ariakit.com/components/dialog) component,
   * establishing the initial focus as the dialog opens.
   *
   * **Note**: For this prop to work, the
   * [`focusable`](https://solid.ariakit.com/reference/command#focusable) prop
   * must be set to `true`, if it's not set by default.
   *
   * Live examples:
   * - [Warning on Dialog
   *   hide](https://solid.ariakit.com/examples/dialog-hide-warning)
   * - [Dialog with React
   *   Router](https://solid.ariakit.com/examples/dialog-react-router)
   * - [Nested Dialog](https://solid.ariakit.com/examples/dialog-nested)
   * @default false
   */
  autoFocus?: boolean;
  /**
   * Determines if [Focusable](https://solid.ariakit.com/components/focusable)
   * features should be active on non-native focusable elements.
   *
   * **Note**: This prop only turns off the additional features provided by the
   * [`Focusable`](https://solid.ariakit.com/reference/focusable) component.
   * Non-native focusable elements will lose their focusability entirely.
   * However, native focusable elements will retain their inherent focusability,
   * but without added features such as improved
   * [`autoFocus`](https://solid.ariakit.com/reference/focusable#autofocus),
   * [`accessibleWhenDisabled`](https://solid.ariakit.com/reference/focusable#accessiblewhendisabled),
   * [`onFocusVisible`](https://solid.ariakit.com/reference/focusable#onfocusvisible),
   * etc.
   * @default true
   */
  focusable?: boolean;
  /**
   * Indicates whether the element should be focusable even when it is
   * [`disabled`](https://solid.ariakit.com/reference/focusable#disabled).
   *
   * This is important when discoverability is a concern. For example:
   *
   * > A toolbar in an editor contains a set of special smart paste functions
   * that are disabled when the clipboard is empty or when the function is not
   * applicable to the current content of the clipboard. It could be helpful to
   * keep the disabled buttons focusable if the ability to discover their
   * functionality is primarily via their presence on the toolbar.
   *
   * Learn more on [Focusability of disabled
   * controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#focusabilityofdisabledcontrols).
   *
   * Live examples:
   * - [Combobox with Tabs](https://solid.ariakit.com/examples/combobox-tabs)
   * - [Command Menu with
   *   Tabs](https://solid.ariakit.com/examples/dialog-combobox-tab-command-menu)
   */
  accessibleWhenDisabled?: boolean;
  /**
   * Custom event handler invoked when the element gains focus through keyboard
   * interaction or a key press occurs while the element is in focus. This is
   * the programmatic equivalent of the
   * [`data-focus-visible`](https://solid.ariakit.com/guide/styling#data-focus-visible)
   * attribute.
   *
   * **Note**: For this prop to work, the
   * [`focusable`](https://solid.ariakit.com/reference/command#focusable) prop
   * must be set to `true`, if it's not set by default.
   *
   * Live examples:
   * - [Navigation Menubar](https://solid.ariakit.com/examples/menubar-navigation)
   * - [Custom Checkbox](https://solid.ariakit.com/examples/checkbox-custom)
   */
  onFocusVisible?: BivariantCallback<(event: Event) => void>;
}

export type FocusableProps<T extends ValidComponent = TagName> = Props<
  T,
  FocusableOptions<T>
>;
