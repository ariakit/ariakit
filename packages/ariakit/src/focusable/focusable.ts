import {
  EventHandler,
  FocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useEvent,
  useForkRef,
  useSafeLayoutEffect,
  useTagName,
} from "ariakit-react-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { isButton } from "ariakit-utils/dom";
import {
  addGlobalEventListener,
  isFocusEventOutside,
  isPortalEvent,
  isSelfTarget,
  queueBeforeEvent,
} from "ariakit-utils/events";
import { focusIfNeeded, hasFocus, isFocusable } from "ariakit-utils/focus";
import { queueMicrotask } from "ariakit-utils/misc";
import { isSafari } from "ariakit-utils/platform";
import { As, BivariantCallback, Options, Props } from "ariakit-utils/types";

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
  return false;
}

// See https://github.com/ariakit/ariakit/issues/1257
function isAlwaysFocusVisibleDelayed(element: HTMLElement) {
  const role = element.getAttribute("role");
  if (role === "combobox") return true;
  return false;
}

function getLabels(element: HTMLElement | HTMLInputElement) {
  if ("labels" in element) {
    return element.labels;
  }
  return null;
}

function isNativeCheckboxOrRadio(element: { tagName: string; type?: string }) {
  const tagName = element.tagName.toLowerCase();
  if (tagName === "input" && element.type) {
    return element.type === "radio" || element.type === "checkbox";
  }
  return false;
}

function isNativeTabbable(tagName?: string) {
  if (!tagName) return true;
  return (
    tagName === "button" ||
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

function getTabIndex(
  focusable: boolean,
  trulyDisabled: boolean,
  nativeTabbable: boolean,
  supportsDisabled: boolean,
  tabIndexProp?: number
) {
  if (!focusable) {
    return tabIndexProp;
  }
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
    // If the element is enabled and it's natively tabbable, we don't need to
    // specify a tabIndex attribute unless it's explicitly set by the user.
    return tabIndexProp;
  }
  // If the element is enabled and is not natively tabbable, we have to
  // fallback tabIndex={0}.
  return tabIndexProp || 0;
}

function useDisableEvent(
  onEvent?: EventHandler<SyntheticEvent>,
  disabled?: boolean
) {
  return useEvent((event: SyntheticEvent) => {
    onEvent?.(event);
    if (event.defaultPrevented) return;
    if (disabled) {
      event.stopPropagation();
      event.preventDefault();
    }
  });
}

// isKeyboardModality should be true by defaault.
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
  isKeyboardModality = true;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an element that can be focused.
 * @see https://ariakit.org/components/focusable
 * @example
 * ```jsx
 * const props = useFocusable();
 * <Role {...props}>Focusable</Role>
 * ```
 */
export const useFocusable = createHook<FocusableOptions>(
  ({
    focusable = true,
    accessibleWhenDisabled,
    autoFocus,
    onFocusVisible,
    ...props
  }) => {
    const ref = useRef<HTMLDivElement>(null);

    // Add global event listeners to determine whether the user is using a
    // keyboard to navigate the site or not.
    useEffect(() => {
      if (!focusable) return;
      addGlobalEventListener("mousedown", onGlobalMouseDown, true);
      addGlobalEventListener("keydown", onGlobalKeyDown, true);
    }, [focusable]);

    // Safari and Firefox on Apple devices don't focus on checkboxes or radio
    // buttons when their labels are clicked. This effect will make sure the
    // focusable element is focused on label click.
    if (isSafariBrowser) {
      useEffect(() => {
        if (!focusable) return;
        const element = ref.current;
        if (!element) return;
        if (!isNativeCheckboxOrRadio(element)) return;
        const labels = getLabels(element);
        if (!labels) return;
        const onMouseUp = () => queueMicrotask(() => element.focus());
        labels.forEach((label) => label.addEventListener("mouseup", onMouseUp));
        return () => {
          labels.forEach((label) =>
            label.removeEventListener("mouseup", onMouseUp)
          );
        };
      }, [focusable]);
    }

    const disabled = focusable && props.disabled;
    const trulyDisabled = !!disabled && !accessibleWhenDisabled;
    const [focusVisible, setFocusVisible] = useState(false);

    // When the focusable element is disabled, it doesn't trigger a blur event
    // so we can't set focusVisible to false there. Instead, we have to do it
    // here by checking the element's disabled attribute.
    useEffect(() => {
      if (!focusable) return;
      if (trulyDisabled && focusVisible) {
        setFocusVisible(false);
      }
    }, [focusable, trulyDisabled, focusVisible]);

    // When an element that has focus becomes hidden, it doesn't trigger a blur
    // event so we can't set focusVisible to false there. We observe the element
    // and check if it's still focusable. Otherwise, we set focusVisible to
    // false.
    useEffect(() => {
      if (!focusable) return;
      if (!focusVisible) return;
      const element = ref.current;
      if (!element) return;
      if (typeof IntersectionObserver === "undefined") return;
      const observer = new IntersectionObserver(() => {
        if (!isFocusable(element)) {
          setFocusVisible(false);
        }
      });
      observer.observe(element);
      return () => observer.disconnect();
    }, [focusable, focusVisible]);

    // Disable events when the element is disabled.
    const onKeyPressCapture = useDisableEvent(
      props.onKeyPressCapture,
      disabled
    );
    const onMouseDownCapture = useDisableEvent(
      props.onMouseDownCapture,
      disabled
    );
    const onClickCapture = useDisableEvent(props.onClickCapture, disabled);

    const onMouseDownProp = props.onMouseDown;

    const onMouseDown = useEvent((event: ReactMouseEvent<HTMLDivElement>) => {
      onMouseDownProp?.(event);
      if (event.defaultPrevented) return;
      if (!focusable) return;
      const element = event.currentTarget;
      // Safari doesn't focus on buttons on mouse down like other
      // browsers/platforms. Instead, it focuses on the closest focusable
      // ancestor element, which is ultimately the body element. So we make sure
      // to give focus to this Focusable element on mouse down so it works
      // consistently across browsers.
      if (!isSafariBrowser) return;
      if (isPortalEvent(event)) return;
      if (!isButton(element) && !isNativeCheckboxOrRadio(element)) return;
      // In future versions os Safari, it may change this behavior and start
      // focusing on buttons on mouse down. To account for that, we check if the
      // element has received focus before.
      let receivedFocus = false;
      const onFocus = () => {
        receivedFocus = true;
      };
      const options = { capture: true, once: true };
      element.addEventListener("focusin", onFocus, options);
      // We can't focus right away after on mouse down, otherwise it would
      // prevent drag events from happening. So we queue the focus to the next
      // animation frame, but always before the next mouseup event. The mouseup
      // event might happen before the next animation frame on touch devices or
      // by tapping on a MacBook's trackpad, for example.
      queueBeforeEvent(element, "mouseup", () => {
        element.removeEventListener("focusin", onFocus, true);
        if (receivedFocus) return;
        focusIfNeeded(element);
      });
    });

    const handleFocusVisible = (
      event: SyntheticEvent<HTMLDivElement>,
      currentTarget?: HTMLDivElement
    ) => {
      if (currentTarget) {
        event.currentTarget = currentTarget;
      }
      onFocusVisible?.(event);
      if (event.defaultPrevented) return;
      if (!focusable) return;
      const element = event.currentTarget;
      if (!element) return;
      // Some extensions like 1password dispatches some keydown events on
      // autofill and immediately moves focus to the next field. That's why we
      // need to check if the current element is still focused.
      if (!hasFocus(element)) return;
      setFocusVisible(true);
    };

    const onKeyDownCaptureProp = props.onKeyDownCapture;

    const onKeyDownCapture = useEvent(
      (event: ReactKeyboardEvent<HTMLDivElement>) => {
        onKeyDownCaptureProp?.(event);
        if (event.defaultPrevented) return;
        if (!focusable) return;
        if (focusVisible) return;
        if (event.metaKey) return;
        if (event.altKey) return;
        if (event.ctrlKey) return;
        if (!isSelfTarget(event)) return;
        const element = event.currentTarget;
        queueMicrotask(() => handleFocusVisible(event, element));
      }
    );

    const onFocusCaptureProp = props.onFocusCapture;

    const onFocusCapture = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onFocusCaptureProp?.(event);
      if (event.defaultPrevented) return;
      if (!focusable) return;
      if (!isSelfTarget(event)) {
        setFocusVisible(false);
        return;
      }
      const element = event.currentTarget;
      const applyFocusVisible = () => handleFocusVisible(event, element);
      if (isKeyboardModality || isAlwaysFocusVisible(event.target)) {
        queueMicrotask(applyFocusVisible);
      }
      // See https://github.com/ariakit/ariakit/issues/1257
      else if (isAlwaysFocusVisibleDelayed(event.target)) {
        queueBeforeEvent(event.target, "focusout", applyFocusVisible);
      } else {
        setFocusVisible(false);
      }
    });

    const onBlurProp = props.onBlur;

    // Note: Can't use onBlurCapture here otherwise it will not work with
    // CompositeItem's with the virtualFocus state set to true.
    const onBlur = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onBlurProp?.(event);
      if (!focusable) return;
      if (isFocusEventOutside(event)) {
        setFocusVisible(false);
      }
    });

    // The native autoFocus prop is problematic in many ways. For example, when
    // an element has the native autofocus attribute, the focus event will be
    // triggered before React effects (even layout effects) and before refs are
    // assigned. This means we won't have access to the element's ref or
    // anything else that's set up by React effects on the onFocus event. So we
    // don't pass the autoFocus prop to the element and instead manually focus
    // the element when it's mounted. The order in which this effect runs also
    // matters. It must be declared here after all the event callbacks above so
    // the event callback effects run before this one. See
    // https://twitter.com/diegohaz/status/1408180632933388289
    useSafeLayoutEffect(() => {
      if (!focusable) return;
      if (autoFocus) {
        ref.current?.focus();
      }
    }, [focusable, autoFocus]);

    const tagName = useTagName(ref, props.as);
    const nativeTabbable = focusable && isNativeTabbable(tagName);
    const supportsDisabled = focusable && supportsDisabledAttribute(tagName);
    const style = trulyDisabled
      ? { pointerEvents: "none" as const, ...props.style }
      : props.style;

    props = {
      "data-focus-visible": focusable && focusVisible ? "" : undefined,
      "aria-disabled": disabled ? true : undefined,
      ...props,
      ref: useForkRef(ref, props.ref),
      style,
      tabIndex: getTabIndex(
        focusable,
        trulyDisabled,
        nativeTabbable,
        supportsDisabled,
        props.tabIndex
      ),
      disabled: supportsDisabled && trulyDisabled ? true : undefined,
      // TODO: Test Focusable contentEditable.
      contentEditable: disabled ? undefined : props.contentEditable,
      onKeyPressCapture,
      onClickCapture,
      onMouseDownCapture,
      onMouseDown,
      onKeyDownCapture,
      onFocusCapture,
      onBlur,
    };

    return props;
  }
);

/**
 * A component that renders an element that can be focused.
 * @see https://ariakit.org/components/focusable
 * @example
 * ```jsx
 * <Focusable>Focusable</Focusable>
 * ```
 */
export const Focusable = createComponent<FocusableOptions>((props) => {
  props = useFocusable(props);
  return createElement("div", props);
});

if (process.env.NODE_ENV !== "production") {
  Focusable.displayName = "Focusable";
}

export type FocusableOptions<T extends As = "div"> = Options<T> & {
  /**
   * Determines whether the focusable element is disabled. If the focusable
   * element doesn't support the native `disabled` attribute, the
   * `aria-disabled` attribute will be used instead.
   * @default false
   */
  disabled?: boolean;
  /**
   * Automatically focus the element when it is mounted. It works similarly to
   * the native `autoFocus` prop, but solves an issue where the element is
   * given focus before React effects can run.
   * @default false
   */
  autoFocus?: boolean;
  /**
   * Whether the element should be focusable.
   * @default true
   */
  focusable?: boolean;
  /**
   * Determines whether the element should be focusable even when it is
   * disabled.
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
   * controls](https://www.w3.org/TR/wai-aria-practices-1.2/#kbd_disabled_controls).
   */
  accessibleWhenDisabled?: boolean;
  /**
   * Custom event handler that is called when the element is focused via the
   * keyboard or when a key is pressed while the element is focused.
   */
  onFocusVisible?: BivariantCallback<(event: SyntheticEvent) => void>;
};

export type FocusableProps<T extends As = "div"> = Props<FocusableOptions<T>>;
