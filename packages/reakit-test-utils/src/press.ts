import {
  getPreviousTabbableIn,
  getNextTabbableIn,
  isFocusable
} from "reakit-utils";
import { subscribeDefaultPrevented } from "./__utils/subscribeDefaultPrevented";
import { fireEvent } from "./fireEvent";
import { focus } from "./focus";
import { blur } from "./blur";

import "./mockClientRects";

const clickableInputTypes = [
  "button",
  "color",
  "file",
  "image",
  "reset",
  "submit"
];

function submitFormByPressingEnterOn(
  element: HTMLInputElement,
  options: KeyboardEventInit
) {
  const { form } = element;
  if (!form) return;

  const elements = Array.from(form.elements);

  // When pressing enter on an input, the form is submitted only when there is
  // only one of these input types present (or there's a submit button).
  const validTypes = [
    "email",
    "number",
    "password",
    "search",
    "tel",
    "text",
    "url"
  ];

  const validInputs = elements.filter(
    el => el instanceof HTMLInputElement && validTypes.includes(el.type)
  );

  const submitButton = elements.find(
    el =>
      (el instanceof HTMLInputElement || el instanceof HTMLButtonElement) &&
      el.type === "submit"
  );

  if (validInputs.length === 1 || submitButton) {
    fireEvent.submit(form, options);
  }
}

const keyDownMap: Record<
  string,
  (element: Element, options: KeyboardEventInit) => void
> = {
  Tab(element, { shiftKey }) {
    const body = element.ownerDocument?.body || document.body;
    const nextElement = shiftKey
      ? getPreviousTabbableIn(body)
      : getNextTabbableIn(body);
    if (nextElement) {
      focus(nextElement);
    }
  },

  Enter(element, options) {
    const nonSubmittableTypes = [...clickableInputTypes, "hidden"];

    const isClickable =
      element.tagName === "BUTTON" ||
      (element instanceof HTMLInputElement &&
        clickableInputTypes.includes(element.type));

    const isSubmittable =
      element instanceof HTMLInputElement &&
      !nonSubmittableTypes.includes(element.type);

    if (isClickable) {
      fireEvent.click(element, options);
    } else if (isSubmittable) {
      submitFormByPressingEnterOn(element as HTMLInputElement, options);
    }
  }
};

const keyUpMap: Record<
  string,
  (element: Element, options: KeyboardEventInit) => void
> = {
  // Space
  " ": (element, options) => {
    const spaceableTypes = [...clickableInputTypes, "checkbox", "radio"];

    const isSpaceable =
      element.tagName === "BUTTON" ||
      (element instanceof HTMLInputElement &&
        spaceableTypes.includes(element.type));

    if (isSpaceable) {
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

  // We can't press on elements that aren't focusable
  if (!isFocusable(element) && element.tagName !== "BODY") return;

  // If element is not focused, we should focus it
  if (element.ownerDocument?.activeElement !== element) {
    if (element.tagName === "BODY") {
      blur();
    } else {
      focus(element);
    }
  }

  // Track event.preventDefault() calls so we bail out of keydown/keyup effects
  const defaultPrevented = subscribeDefaultPrevented(
    element,
    "keydown",
    "keyup"
  );

  fireEvent.keyDown(element, { key, ...options });

  if (!defaultPrevented.current && key in keyDownMap && !options.metaKey) {
    keyDownMap[key](element, options);
  }

  // If keydown effect changed focus (e.g. Tab), keyup will be triggered on the
  // next element.
  if (element.ownerDocument?.activeElement !== element) {
    element = element.ownerDocument!.activeElement!;
  }

  fireEvent.keyUp(element, { key, ...options });

  if (!defaultPrevented.current && key in keyUpMap && !options.metaKey) {
    keyUpMap[key](element, options);
  }

  defaultPrevented.unsubscribe();
}

function createPress(key: string, defaultOptions: KeyboardEventInit = {}) {
  return (element?: Element | null, options: KeyboardEventInit = {}) =>
    press(key, element, { ...defaultOptions, ...options });
}

press.Escape = createPress("Escape");
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
