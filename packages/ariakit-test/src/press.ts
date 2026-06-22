import {
  isTextField,
  setSelectionRange,
  getNextTabbable,
  getPreviousTabbable,
  isFocusable,
} from "@ariakit/utils";
import { flushMicrotasks, settle, wrapAsync } from "./__utils.ts";
import { blur } from "./blur.ts";
import { dispatch } from "./dispatch.ts";
import { focus } from "./focus.ts";
import { sleep } from "./sleep.ts";
import { type } from "./type.ts";

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

function isSubmitButton(
  element: Element,
): element is HTMLInputElement | HTMLButtonElement {
  if (element instanceof HTMLButtonElement) {
    return element.type === "submit";
  }
  return (
    element instanceof HTMLInputElement &&
    (element.type === "submit" || element.type === "image")
  );
}

function canSubmitWithButton(
  submitButton: HTMLInputElement | HTMLButtonElement,
) {
  if (!submitButton.form) return false;
  if (isDisabled(submitButton)) return false;
  return isSubmitButton(submitButton);
}

function getFormOwner(element: Element) {
  if (!("form" in element)) return null;
  return element.form as HTMLFormElement | null;
}

function getFormRoot(form: HTMLFormElement) {
  const root = form.getRootNode();
  if ("querySelectorAll" in root) {
    return root as ParentNode;
  }
  return form;
}

function getSubmitButton(form: HTMLFormElement) {
  const root = getFormRoot(form);
  const elements = Array.from(root.querySelectorAll("button,input"));
  return elements.find(
    (element): element is HTMLInputElement | HTMLButtonElement =>
      isSubmitButton(element) && element.form === form,
  );
}

function createKeyboardClickEvent(
  element: Element,
  options: KeyboardEventInit,
) {
  const { defaultView } = element.ownerDocument;
  const MouseEventConstructor = defaultView?.MouseEvent ?? MouseEvent;
  return new MouseEventConstructor("click", {
    bubbles: true,
    cancelable: true,
    composed: true,
    altKey: options.altKey,
    ctrlKey: options.ctrlKey,
    metaKey: options.metaKey,
    shiftKey: options.shiftKey,
  });
}

function dispatchClickEvent(element: Element, event: Event) {
  const { defaultView } = element.ownerDocument;
  if (!defaultView || !("happyDOM" in defaultView)) {
    return element.dispatchEvent(event);
  }

  const eventWindow = defaultView as Window & { event?: Event };
  const hadEvent = Object.prototype.hasOwnProperty.call(eventWindow, "event");
  const previousEvent = eventWindow.event;
  eventWindow.event = event;
  try {
    return element.dispatchEvent(event);
  } finally {
    if (hadEvent) {
      eventWindow.event = previousEvent;
    } else {
      delete eventWindow.event;
    }
  }
}

function dispatchKeyboardClick(element: Element, options: KeyboardEventInit) {
  const event = createKeyboardClickEvent(element, options);
  return dispatchClickEvent(element, event);
}

async function clickSubmitButton(
  submitButton: HTMLInputElement | HTMLButtonElement,
  options: KeyboardEventInit,
) {
  const { form } = submitButton;
  if (!form) {
    dispatchKeyboardClick(submitButton, options);
    await flushMicrotasks();
    return;
  }

  const win = submitButton.ownerDocument.defaultView;
  const root = form.getRootNode();
  let blocked = false;
  let invalid = false;
  let submitted = false;
  const onClick = (event: Event) => {
    if (!canSubmitWithButton(submitButton)) {
      blocked = true;
      event.preventDefault();
    }
  };
  const onInvalid = (event: Event) => {
    const { target } = event;
    if (!(target instanceof Element)) return;
    if (getFormOwner(target) !== submitButton.form) return;
    invalid = true;
  };
  const onSubmit = () => {
    submitted = true;
  };
  submitButton.addEventListener("click", onClick);
  win?.addEventListener("click", onClick);
  form.addEventListener("click", onClick);
  win?.addEventListener("invalid", onInvalid, true);
  win?.addEventListener("submit", onSubmit, true);
  root.addEventListener("invalid", onInvalid, true);
  root.addEventListener("submit", onSubmit, true);
  form.addEventListener("invalid", onInvalid, true);
  form.addEventListener("submit", onSubmit, true);
  try {
    const defaultAllowed = dispatchKeyboardClick(submitButton, options);
    if (!defaultAllowed) return;
    if (blocked) return;
    if (invalid) return;
    if (submitted) return;
    if (!(submitButton instanceof HTMLInputElement)) return;
    if (submitButton.type !== "image") return;
    const currentForm = submitButton.form;
    if (!canSubmitWithButton(submitButton)) return;
    // happy-dom fires the image submitter click but skips its submit activation.
    currentForm?.requestSubmit(submitButton);
  } finally {
    submitButton.removeEventListener("click", onClick);
    win?.removeEventListener("click", onClick);
    form.removeEventListener("click", onClick);
    win?.removeEventListener("invalid", onInvalid, true);
    win?.removeEventListener("submit", onSubmit, true);
    root.removeEventListener("invalid", onInvalid, true);
    root.removeEventListener("submit", onSubmit, true);
    form.removeEventListener("invalid", onInvalid, true);
    form.removeEventListener("submit", onSubmit, true);
    await flushMicrotasks();
  }
}

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
  const submitButton = getSubmitButton(form);
  if (submitButton) {
    if (isDisabled(submitButton)) return;
    await clickSubmitButton(submitButton, options);
  } else if (validInputs.length === 1) {
    await dispatch.submit(form, options);
  }
}

function isNumberInput(element: Element): element is HTMLInputElement {
  return element instanceof HTMLInputElement && element.type === "number";
}

function getFirstLegend(fieldset: HTMLFieldSetElement) {
  for (const child of fieldset.children) {
    if (child instanceof HTMLLegendElement) {
      return child;
    }
  }
  return null;
}

function isDisabledByFieldset(element: Element) {
  let parent = element.parentElement;
  while (parent) {
    if (parent instanceof HTMLFieldSetElement) {
      const legend = getFirstLegend(parent);
      if (parent.disabled && !legend?.contains(element)) {
        return true;
      }
    }
    parent = parent.parentElement;
  }
  return false;
}

// Browsers never activate a disabled control, so the synthetic Enter/Space
// activations below skip one. An element that disables itself in its own keydown
// handler is already disabled by the time the activation runs.
function isDisabled(element: Element | HTMLButtonElement) {
  if (!("disabled" in element)) return false;
  if (element.disabled) return true;
  if (element.matches(":disabled")) return true;
  return isDisabledByFieldset(element);
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
    if (isDisabled(element)) return;

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
      await submitFormByPressingEnterOn(element, options);
    }
  },

  async Home(element, { shiftKey }) {
    if (!isTextField(element)) return;

    if (!shiftKey) {
      return setSelectionRange(element, 0, 0);
    }

    const { selectionStart, selectionEnd, selectionDirection } = element;
    const anchor =
      selectionDirection === "forward"
        ? (selectionStart ?? 0)
        : (selectionEnd ?? 0);
    setSelectionRange(element, 0, anchor, "backward");
  },

  async End(element, { shiftKey }) {
    if (!isTextField(element)) return;

    const length = element.value.length;
    if (!shiftKey) {
      return setSelectionRange(element, length, length);
    }

    const { selectionStart, selectionEnd, selectionDirection } = element;
    const anchor =
      selectionDirection === "backward"
        ? (selectionEnd ?? 0)
        : (selectionStart ?? 0);
    setSelectionRange(element, anchor, length, "forward");
  },

  async ArrowLeft(element, { shiftKey }) {
    if (isTextField(element)) {
      const { value, selectionStart, selectionEnd, selectionDirection } =
        element;
      const [start, end] = [selectionStart ?? 0, selectionEnd ?? 0];
      const collapsing = !shiftKey && start !== end;
      const nextStart = Math.max(0, collapsing ? start : start - 1);
      const nextEnd = Math.min(value.length, shiftKey ? end : nextStart);
      setSelectionRange(
        element,
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
      setSelectionRange(
        element,
        nextStart,
        nextEnd,
        selectionDirection || "forward",
      );
    }
  },

  async ArrowUp(element, { shiftKey }) {
    if (isTextField(element)) {
      if (!shiftKey) {
        return setSelectionRange(element, 0, 0);
      }
      const { selectionStart, selectionEnd, selectionDirection } = element;
      const [start, end] = [selectionStart ?? 0, selectionEnd ?? 0];
      if (selectionDirection === "forward") {
        setSelectionRange(element, start, start);
      } else {
        setSelectionRange(element, 0, end, "backward");
      }
    } else if (isNumberInput(element)) {
      await incrementNumberInput(element);
    }
  },

  async ArrowDown(element, { shiftKey }) {
    if (isTextField(element)) {
      const length = element.value.length;
      if (!shiftKey) {
        setSelectionRange(element, length, length);
      } else {
        const { selectionStart, selectionEnd, selectionDirection } = element;
        const [start, end] = [selectionStart ?? 0, selectionEnd ?? 0];
        if (selectionDirection === "backward") {
          setSelectionRange(element, end, end);
        } else {
          setSelectionRange(element, start, length, "forward");
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

    // Don't synthesize the click on a disabled control — e.g. a split `press.up`
    // landing on a control that disabled itself on keydown but is still focused
    // (the DOM test environments don't blur it the way a real browser does, and
    // jsdom would otherwise fire the click).
    if (isSpaceable && !isDisabled(element)) {
      await dispatch.click(element, options);
    }
  },
};

function getPressTarget(element?: Element | null) {
  if (element == null) {
    return document.activeElement || document.body;
  }
  return element;
}

// We can't press a key on elements that aren't focusable. The body is the
// exception: once focus leaves every focusable element, key events land on it.
function isPressable(element: Element) {
  return isFocusable(element) || element.tagName === "BODY";
}

// Fires `keydown` and applies the browser's default keydown behavior for the key
// (moving focus with `Tab`, the caret with the arrow keys, etc.). Returns whether
// the default action was allowed so the caller can gate the keyup behavior on it.
async function pressKeyDown(
  element: Element,
  key: string,
  options: KeyboardEventInit,
) {
  const defaultAllowed = await dispatch.keyDown(element, { key, ...options });
  if (defaultAllowed && key in keyDownMap && !options.metaKey) {
    await keyDownMap[key]?.(element, options);
  }
  return defaultAllowed;
}

interface PressKeyUpParams {
  element: Element;
  key: string;
  options: KeyboardEventInit;
  // Whether the matching keydown's default action was allowed. The keyup's
  // default behavior is applied only when both this and the keyup event itself
  // weren't prevented. Defaults to `true` for a standalone keyup with no
  // preceding keydown to account for.
  defaultAllowed?: boolean;
}

// Fires `keyup` and applies the browser's default keyup behavior for the key
// (clicking buttons, checkboxes, and radios with `Space`).
async function pressKeyUp({
  element,
  key,
  options,
  defaultAllowed = true,
}: PressKeyUpParams) {
  if (!(await dispatch.keyUp(element, { key, ...options }))) {
    defaultAllowed = false;
  }
  if (defaultAllowed && key in keyUpMap && !options.metaKey) {
    await keyUpMap[key]?.(element, options);
  }
}

/**
 * Presses a key on an element, simulating a real user keyboard interaction. Fires
 * `keydown` and `keyup` and applies the browser's default behavior for that key —
 * moving focus with `Tab`, activating buttons and submitting forms with `Enter`,
 * clicking buttons, checkboxes, and radios with `Space`, moving the caret with the
 * arrow and `Home`/`End` keys, and typing printable characters into text fields.
 *
 * When no element is passed, the currently focused element is used. Shortcuts such
 * as `press.Enter()` and `press.Tab()` are provided for common keys, and
 * `press.ShiftTab()` moves focus backwards.
 *
 * Use `press.down` and `press.up` to fire only the keydown or keyup
 * half of a press. Each defaults to the currently focused element, so a key
 * released after focus moved away — for example, an element that disables itself
 * on keydown — lands where a real browser would deliver it.
 * @example
 * ```ts
 * await press.Tab();
 * await press.Enter();
 * // `press.Enter(element)` is shorthand for `press("Enter", element)`:
 * await press.Enter(q.button("Submit"));
 * // Split a press so the keyup lands on whatever is focused at release time:
 * await press.down.Space();
 * await press.up.Space();
 * ```
 */
export function press(
  key: string,
  element?: Element | null,
  options: KeyboardEventInit = {},
) {
  return wrapAsync(async () => {
    element = getPressTarget(element);

    if (!element) return;

    // We can't press on elements that aren't focusable
    if (!isPressable(element)) return;

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
    await settle();

    // TODO: Implement repeat
    const defaultAllowed = await pressKeyDown(element, key, options);

    await settle();

    // If keydown effect changed focus (e.g. Tab), keyup will be triggered on the
    // next element.
    if (element.ownerDocument?.activeElement !== element) {
      element = element.ownerDocument.activeElement!;
    }

    await pressKeyUp({ element, key, options, defaultAllowed });

    await sleep();
  });
}

/**
 * Fires only the `keydown` half of a key press on an element, simulating a real
 * user pressing a key down without releasing it yet. Focuses the element first
 * (since a key press always lands on the focused element) and applies the
 * browser's default keydown behavior for the key, such as moving focus with `Tab`
 * or the caret with the arrow keys. As a low-level half of a press, it fires a
 * raw `keydown` and does not type printable characters into text fields the way
 * the combined `press` does.
 *
 * When no element is passed, the currently focused element is used. Pair it with
 * `press.up` to drive a press in two steps, which matters when the keydown
 * moves focus — for example, an element that disables itself on keydown blurs to
 * the body, so the later keyup must land there, not on the original element.
 * Shortcuts such as `press.down.Space()` are provided for common keys.
 * @example
 * ```ts
 * await press.down.Space(q.button("Mute"));
 * await press.up.Space();
 * ```
 */
function pressDown(
  key: string,
  element?: Element | null,
  options: KeyboardEventInit = {},
) {
  return wrapAsync(async () => {
    element = getPressTarget(element);

    if (!element) return;
    if (!isPressable(element)) return;

    // A key press always lands on the focused element, so focus the target first.
    if (element.ownerDocument?.activeElement !== element) {
      if (element.tagName === "BODY") {
        await blur();
      } else {
        await focus(element);
      }
    }

    // This allows the DOM to be updated before we fire the event
    await settle();

    // TODO: Implement repeat
    await pressKeyDown(element, key, options);

    await sleep();
  });
}

/**
 * Fires only the `keyup` half of a key press, simulating a real user releasing a
 * key. Unlike `press.down`, it doesn't move focus: the keyup lands on the
 * passed element or, when none is given, on the currently focused element — which
 * is where a real browser delivers it after the matching `press.down`.
 * Applies the browser's default keyup behavior for the key, such as clicking
 * buttons, checkboxes, and radios with `Space`. Because it runs independently of
 * the matching `press.down`, it can't suppress that default based on the keydown's
 * default having been prevented the way the combined `press` does — though it
 * still respects the keyup event's own cancellation and the Meta key. Use the
 * combined `press` when that distinction matters.
 *
 * Shortcuts such as `press.up.Space()` are provided for common keys.
 * @example
 * ```ts
 * await press.down.Space();
 * // The element disabled itself on keydown and blurred to the body, so the
 * // keyup correctly lands on the body instead of the now-disabled element.
 * await press.up.Space();
 * ```
 */
function pressUp(
  key: string,
  element?: Element | null,
  options: KeyboardEventInit = {},
) {
  return wrapAsync(async () => {
    element = getPressTarget(element);

    if (!element) return;

    // No `isPressable` guard here, unlike `press` and `press.down`. A keyup lands
    // on whatever currently holds focus, which can be an element that just became
    // unfocusable — e.g. one that disabled itself on the matching keydown but is
    // still `document.activeElement` until the browser blurs it.
    await pressKeyUp({ element, key, options });

    await sleep();
  });
}

type PressShortcut = (
  element?: Element | null,
  options?: KeyboardEventInit,
) => Promise<void>;

function createPress(key: string, defaultOptions: KeyboardEventInit = {}) {
  return (element?: Element | null, options: KeyboardEventInit = {}) =>
    press(key, element, { ...defaultOptions, ...options });
}

function createPressDown(key: string, defaultOptions: KeyboardEventInit = {}) {
  return (element?: Element | null, options: KeyboardEventInit = {}) =>
    pressDown(key, element, { ...defaultOptions, ...options });
}

function createPressUp(key: string, defaultOptions: KeyboardEventInit = {}) {
  return (element?: Element | null, options: KeyboardEventInit = {}) =>
    pressUp(key, element, { ...defaultOptions, ...options });
}

// Builds the per-key shortcut map (`.Space`, `.Enter`, `.ShiftTab`, ...) attached
// to `press.down` and `press.up` from the matching factory.
function createKeyShortcuts(
  create: (key: string, defaultOptions?: KeyboardEventInit) => PressShortcut,
) {
  return {
    Escape: create("Escape"),
    Backspace: create("Backspace"),
    Delete: create("Delete"),
    Tab: create("Tab"),
    ShiftTab: create("Tab", { shiftKey: true }),
    Enter: create("Enter"),
    Space: create(" "),
    ArrowUp: create("ArrowUp"),
    ArrowRight: create("ArrowRight"),
    ArrowDown: create("ArrowDown"),
    ArrowLeft: create("ArrowLeft"),
    End: create("End"),
    Home: create("Home"),
    PageUp: create("PageUp"),
    PageDown: create("PageDown"),
  };
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

press.down = Object.assign(pressDown, createKeyShortcuts(createPressDown));

press.up = Object.assign(pressUp, createKeyShortcuts(createPressUp));
