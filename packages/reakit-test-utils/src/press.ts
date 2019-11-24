import getKeyCode from "keycode";
import {
  focusNextTabbableIn,
  focusPreviousTabbableIn,
  isFocusable
} from "reakit-utils/tabbable";
import { fireEvent } from "./react-testing-library";

const beforeKeyUpMap: Record<
  string,
  (element: Element, options: KeyboardEventInit) => void
> = {
  Tab(_, { shiftKey }) {
    if (shiftKey) {
      focusPreviousTabbableIn(document.body);
    } else {
      focusNextTabbableIn(document.body);
    }
  },
  Enter(element, options) {
    if (options.metaKey) return;
    if (element instanceof HTMLInputElement && element.type !== "button") {
      if (element.form) {
        fireEvent.submit(element.form, options);
      }
    } else if (isFocusable(element)) {
      fireEvent.click(element, options);
    }
  }
};

const afterKeyUpMap: Record<
  string,
  (element: Element, options: KeyboardEventInit) => void
> = {
  " ": (element, options) => {
    if (options.metaKey) return;
    if (element instanceof HTMLButtonElement) {
      fireEvent.click(element, options);
    }
  }
};

export function press(
  key: string,
  element?: Element | null,
  options: KeyboardEventInit = {}
) {
  if (element == null) {
    element = document.activeElement || document.body;
  }

  if (!element) return;

  const keyCode = getKeyCode(key);

  let event: KeyboardEvent = new KeyboardEvent("keydown");

  const assignEvent = (evt: KeyboardEvent) => {
    event = evt;
  };

  element.addEventListener("keydown", assignEvent);
  element.addEventListener("keyup", assignEvent);

  fireEvent.keyDown(element, { key, keyCode, ...options });

  if (!event.defaultPrevented && key in beforeKeyUpMap) {
    beforeKeyUpMap[key](element, options);
  }

  fireEvent.keyUp(element, { key, keyCode, ...options });

  if (!event.defaultPrevented && key in afterKeyUpMap) {
    afterKeyUpMap[key](element, options);
  }
}

function createPress(key: string, defaultOptions: KeyboardEventInit = {}) {
  return (element?: Element | null, options: KeyboardEventInit = {}) =>
    press(key, element, { ...defaultOptions, ...options });
}

// Whitespace keys
press.Tab = createPress("Tab");
press.ShiftTab = createPress("Tab", { shiftKey: true });
press.Enter = createPress("Enter");
press.Space = createPress(" ");

// Navigation keys
press.ArrowUp = createPress("ArrowUp");
press.ArrowRight = createPress("ArrowRight");
press.ArrowDown = createPress("ArrowDown");
press.ArrowLeft = createPress("ArrowLeft");
press.End = createPress("End");
press.Home = createPress("Home");
press.PageUp = createPress("PageUp");
press.PageDown = createPress("PageDown");
