import "./__mock-get-client-rects";

import { isTextField } from "ariakit-utils/dom";
import {
  getNextTabbable,
  getPreviousTabbable,
  isFocusable,
} from "ariakit-utils/focus";
import { queuedMicrotasks } from "./__utils";
import { blur } from "./blur";
import { fireEvent } from "./fire-event";
import { focus } from "./focus";
import { sleep } from "./sleep";

const clickableInputTypes = [
  "button",
  "color",
  "file",
  "image",
  "reset",
  "submit",
];

// TODO: Press should type when it's a printable character and the element is an
// input?
function submitFormByPressingEnterOn(
  element: HTMLInputElement,
  options: KeyboardEventInit
) {
  const { form } = element;
  if (!form) return;

  const elements = Array.from(form.elements);

  const validInputs = elements.filter(
    (el) => el instanceof HTMLInputElement && isTextField(el)
  );

  const submitButton = elements.find(
    (el) =>
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
  Tab(_, { shiftKey }) {
    const nextElement = shiftKey ? getPreviousTabbable() : getNextTabbable();
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

    const isLineBreakable = element instanceof HTMLTextAreaElement;

    if (isClickable) {
      fireEvent.click(element, options);
    } else if (isLineBreakable) {
      (element as HTMLTextAreaElement).value += "\n";
    } else if (isSubmittable) {
      submitFormByPressingEnterOn(element as HTMLInputElement, options);
    }
  },

  // TODO: Implement Arrow/Home/End movement on inputs.
  ArrowLeft(element, { shiftKey }) {
    if (element instanceof HTMLElement && isTextField(element)) {
      const start = element.selectionStart ?? 0;
      const end = element.selectionEnd ?? 0;
      const nextStart = Math.max(
        0,
        !shiftKey && start !== end ? start : start - 1
      );
      const nextEnd = Math.min(
        element.value.length,
        shiftKey ? end : nextStart
      );
      element.setSelectionRange(nextStart, nextEnd);
    }
  },

  // TODO: Refactor and test ArrowUp and ArrowDown
  ArrowUp(element) {
    if (element instanceof HTMLInputElement && element.type === "number") {
      const value = +element.value + 1;
      const max = element.max ? +element.max : Number.MAX_SAFE_INTEGER;
      const min = element.min ? +element.min : Number.MIN_SAFE_INTEGER;
      if (value > max || value < min) return;
      element.value = value.toString();
      fireEvent.input(element);
      fireEvent.change(element);
    }
  },

  ArrowDown(element) {
    if (element instanceof HTMLInputElement && element.type === "number") {
      const value = +element.value - 1;
      const max = element.max ? +element.max : Number.MAX_SAFE_INTEGER;
      const min = element.min ? +element.min : Number.MIN_SAFE_INTEGER;
      if (value > max || value < min) return;
      element.value = value.toString();
      fireEvent.input(element);
      fireEvent.change(element);
    }
  },
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
  },
};

export async function press(
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

  let defaultAllowed = fireEvent.keyDown(element, { key, ...options });

  await queuedMicrotasks();

  if (defaultAllowed && key in keyDownMap && !options.metaKey) {
    keyDownMap[key]?.(element, options);
  }

  await sleep();

  // If keydown effect changed focus (e.g. Tab), keyup will be triggered on the
  // next element.
  if (element.ownerDocument?.activeElement !== element) {
    element = element.ownerDocument!.activeElement!;
  }

  if (!fireEvent.keyUp(element, { key, ...options })) {
    defaultAllowed = false;
  }

  await queuedMicrotasks();

  if (defaultAllowed && key in keyUpMap && !options.metaKey) {
    keyUpMap[key]?.(element, options);
  }

  await sleep();
}

function createPress(key: string, defaultOptions: KeyboardEventInit = {}) {
  return (element?: Element | null, options: KeyboardEventInit = {}) =>
    press(key, element, { ...defaultOptions, ...options });
}

press.Escape = createPress("Escape");
press.Backspace = createPress("Backspace");
press.Delete = createPress("Delete");
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
