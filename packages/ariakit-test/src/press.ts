import "./polyfills.js";
import { isTextField } from "@ariakit/core/utils/dom";
import {
  getNextTabbable,
  getPreviousTabbable,
  isFocusable,
} from "@ariakit/core/utils/focus";
import { wrapAsync } from "./__utils.js";
import { blur } from "./blur.js";
import { dispatch } from "./dispatch.js";
import { focus } from "./focus.js";
import { sleep } from "./sleep.js";
import { type } from "./type.js";

type KeyActionMap = Record<
  string,
  (element: Element, options: KeyboardEventInit) => Promise<void>
>;

const clickableInputTypes = [
  "button",
  "color",
  "file",
  "image",
  "reset",
  "submit",
];

async function submitFormByPressingEnterOn(
  element: HTMLInputElement,
  options: KeyboardEventInit,
) {
  const { form } = element;
  if (!form) return;
  const elements = Array.from(form.elements);
  const validInputs = elements.filter(
    (el) => el instanceof HTMLInputElement && isTextField(el),
  );
  const submitButton = elements.find(
    (el) =>
      (el instanceof HTMLInputElement || el instanceof HTMLButtonElement) &&
      el.type === "submit",
  );
  if (validInputs.length === 1 || submitButton) {
    await dispatch.submit(form, options);
  }
}

function isNumberInput(element: Element): element is HTMLInputElement {
  return element instanceof HTMLInputElement && element.type === "number";
}

async function incrementNumberInput(element: HTMLInputElement, by = 1) {
  const value = +element.value + by;
  const max = element.max ? +element.max : Number.MAX_SAFE_INTEGER;
  const min = element.min ? +element.min : Number.MIN_SAFE_INTEGER;
  if (value > max || value < min) return;
  element.value = value.toString();
  await dispatch.input(element);
  await dispatch.change(element);
}

const keyDownMap: KeyActionMap = {
  async Tab(_, { shiftKey }) {
    const nextElement = shiftKey ? getPreviousTabbable() : getNextTabbable();
    if (nextElement) {
      await focus(nextElement);
    }
  },

  async Enter(element, options) {
    const nonSubmittableTypes = [...clickableInputTypes, "hidden"];

    const isClickable =
      element.tagName === "BUTTON" ||
      (element instanceof HTMLInputElement &&
        clickableInputTypes.includes(element.type));

    const isSubmittable =
      element instanceof HTMLInputElement &&
      !nonSubmittableTypes.includes(element.type);

    if (isClickable) {
      await dispatch.click(element, options);
    } else if (isSubmittable) {
      await submitFormByPressingEnterOn(element as HTMLInputElement, options);
    }
  },

  async ArrowLeft(element, { shiftKey }) {
    if (isTextField(element)) {
      const { value, selectionStart, selectionEnd, selectionDirection } =
        element;
      const [start, end] = [selectionStart ?? 0, selectionEnd ?? 0];
      const collapsing = !shiftKey && start !== end;
      const nextStart = Math.max(0, collapsing ? start : start - 1);
      const nextEnd = Math.min(value.length, shiftKey ? end : nextStart);
      element.setSelectionRange(
        nextStart,
        nextEnd,
        selectionDirection || "backward",
      );
    }
  },

  async ArrowRight(element, { shiftKey }) {
    if (isTextField(element)) {
      const { value, selectionStart, selectionEnd, selectionDirection } =
        element;
      const [start, end] = [selectionStart ?? 0, selectionEnd ?? 0];
      const collapsing = !shiftKey && start !== end;
      const nextEnd = Math.min(value.length, collapsing ? end : end + 1);
      const nextStart = Math.max(0, shiftKey ? start : nextEnd);
      element.setSelectionRange(
        nextStart,
        nextEnd,
        selectionDirection || "forward",
      );
    }
  },

  async ArrowUp(element, { shiftKey }) {
    if (isTextField(element)) {
      if (!shiftKey) {
        return element.setSelectionRange(0, 0);
      } else {
        const { selectionStart, selectionEnd, selectionDirection } = element;
        const [start, end] = [selectionStart ?? 0, selectionEnd ?? 0];
        if (selectionDirection === "forward") {
          element.setSelectionRange(start, start);
        } else {
          element.setSelectionRange(0, end, "backward");
        }
      }
    } else if (isNumberInput(element)) {
      await incrementNumberInput(element);
    }
  },

  async ArrowDown(element, { shiftKey }) {
    if (isTextField(element)) {
      const length = element.value.length;
      if (!shiftKey) {
        element.setSelectionRange(length, length);
      } else {
        const { selectionStart, selectionEnd, selectionDirection } = element;
        const [start, end] = [selectionStart ?? 0, selectionEnd ?? 0];
        if (selectionDirection === "backward") {
          element.setSelectionRange(end, end);
        } else {
          element.setSelectionRange(start, length, "forward");
        }
      }
    } else if (isNumberInput(element)) {
      await incrementNumberInput(element, -1);
    }
  },
};

const keyUpMap: KeyActionMap = {
  // Space
  " ": async (element, options) => {
    const spaceableTypes = [...clickableInputTypes, "checkbox", "radio"];

    const isSpaceable =
      element.tagName === "BUTTON" ||
      (element instanceof HTMLInputElement &&
        spaceableTypes.includes(element.type));

    if (isSpaceable) {
      await dispatch.click(element, options);
    }
  },
};

export function press(
  key: string,
  element?: Element | null,
  options: KeyboardEventInit = {},
) {
  return wrapAsync(async () => {
    if (element == null) {
      element = document.activeElement || document.body;
    }

    if (!element) return;

    // We can't press on elements that aren't focusable
    if (!isFocusable(element) && element.tagName !== "BODY") return;

    // If it's a printable character, we type it
    if (isTextField(element)) {
      if (key.length === 1) {
        return type(key, element, options);
      } else if (key === "Delete") {
        return type("\x7f", element, options);
      } else if (key === "Backspace") {
        return type("\b", element, options);
      } else if (key === "Enter" && element.tagName === "TEXTAREA") {
        return type("\n", element, options);
      }
    }

    // If element is not focused, we should focus it
    if (element.ownerDocument?.activeElement !== element) {
      if (element.tagName === "BODY") {
        await blur();
      } else {
        await focus(element);
      }
    }

    // This allows the DOM to be updated before we fire the event
    await sleep();

    let defaultAllowed = await dispatch.keyDown(element, { key, ...options });

    if (defaultAllowed && key in keyDownMap && !options.metaKey) {
      await keyDownMap[key]?.(element, options);
    }

    await sleep();

    // If keydown effect changed focus (e.g. Tab), keyup will be triggered on the
    // next element.
    if (element.ownerDocument?.activeElement !== element) {
      element = element.ownerDocument!.activeElement!;
    }

    if (!(await dispatch.keyUp(element, { key, ...options }))) {
      defaultAllowed = false;
    }

    if (defaultAllowed && key in keyUpMap && !options.metaKey) {
      await keyUpMap[key]?.(element, options);
    }

    await sleep();
  });
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
