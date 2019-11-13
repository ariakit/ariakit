import {
  focusNextTabbableIn,
  focusPreviousTabbableIn
} from "reakit-utils/tabbable";
import { fireEvent } from "./react-testing-library";

const keyMap: Record<
  string,
  (element: Element, options: KeyboardEventInit) => void
> = {
  Tab: (_, { shiftKey }) => {
    if (shiftKey) {
      focusPreviousTabbableIn(document.body);
    } else {
      focusNextTabbableIn(document.body);
    }
  }
};

export function press(
  key: string,
  element: Element | null = document.activeElement,
  options: KeyboardEventInit = {}
) {
  if (!element) return;

  fireEvent.keyDown(element, { key, ...options });
  if (key in keyMap) {
    keyMap[key](element, { key, ...options });
  }
  fireEvent.keyUp(element, { key, ...options });
}

function createPress(key: string, defaultOptions: KeyboardEventInit = {}) {
  return (element?: Element, options = defaultOptions) =>
    press(key, element, options);
}

press.Tab = createPress("Tab");
press.ShiftTab = createPress("Tab", { shiftKey: true });
press.Enter = createPress("Enter");
press.Space = createPress(" ");
press.ArrowUp = createPress("ArrowUp");
press.ArrowRight = createPress("ArrowRight");
press.ArrowDown = createPress("ArrowDown");
press.ArrowLeft = createPress("ArrowLeft");
press.End = createPress("End");
press.Home = createPress("Home");
press.PageUp = createPress("PageUp");
press.PageDown = createPress("PageDown");
