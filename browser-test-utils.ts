import { isVisible } from "@ariakit/utils";
import { fireEvent } from "@testing-library/dom";
import {
  afterEach,
  beforeEach,
  describe,
  expect as baseExpect,
  test,
  vi,
} from "vitest";
import { page, userEvent } from "vitest/browser";
import type {
  Locator,
  LocatorByRoleOptions,
  LocatorOptions,
  UserEventClickOptions,
  UserEventHoverOptions,
} from "vitest/browser";

type Target = Element | Locator | null | undefined;
type QueryOptions = LocatorByRoleOptions & { hidden?: boolean };
type TextOptions = LocatorOptions;
type QueryRoot = typeof page | Locator;
interface PointerPosition {
  x: number;
  y: number;
}

interface HoverOptions extends UserEventHoverOptions {
  clientX?: number;
  clientY?: number;
  movementX?: number;
  movementY?: number;
  position?: PointerPosition;
}

type ExpectOptions = Parameters<typeof baseExpect>[1];
type LocatorExpectOptions = Parameters<typeof baseExpect.element>[1];

const roles = [
  "alert",
  "alertdialog",
  "application",
  "article",
  "banner",
  "blockquote",
  "button",
  "caption",
  "cell",
  "checkbox",
  "code",
  "columnheader",
  "combobox",
  "complementary",
  "contentinfo",
  "definition",
  "deletion",
  "dialog",
  "directory",
  "document",
  "emphasis",
  "feed",
  "figure",
  "form",
  "generic",
  "grid",
  "gridcell",
  "group",
  "heading",
  "img",
  "insertion",
  "link",
  "list",
  "listbox",
  "listitem",
  "log",
  "main",
  "marquee",
  "math",
  "menu",
  "menubar",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "meter",
  "navigation",
  "none",
  "note",
  "option",
  "paragraph",
  "presentation",
  "progressbar",
  "radio",
  "radiogroup",
  "region",
  "row",
  "rowgroup",
  "rowheader",
  "scrollbar",
  "search",
  "searchbox",
  "separator",
  "slider",
  "spinbutton",
  "status",
  "strong",
  "subscript",
  "superscript",
  "switch",
  "tab",
  "table",
  "tablist",
  "tabpanel",
  "term",
  "textbox",
  "time",
  "timer",
  "toolbar",
  "tooltip",
  "tree",
  "treegrid",
  "treeitem",
] as const;

type AriaRole = (typeof roles)[number];

type RoleQuery = ReturnType<typeof createRoleQuery>;
type TextQuery = ReturnType<typeof createTextQuery>;
type LabeledQuery = ReturnType<typeof createLabeledQuery>;
type QueryObject = Record<AriaRole, RoleQuery> & {
  text: TextQuery;
  labeled: LabeledQuery;
  within: (target: Target) => QueryObject;
};

const pendingExpectations: Promise<unknown>[] = [];
let lastPointerPosition: PointerPosition | null = null;
let locatorExpectationTimeout: number | null = null;

function isLocator(value: unknown): value is Locator {
  return Boolean(
    value &&
    typeof value === "object" &&
    "findElement" in value &&
    "query" in value &&
    "selector" in value,
  );
}

function enqueueExpectation<T>(promise: Promise<T>) {
  pendingExpectations.push(
    promise.then(
      () => undefined,
      (error) => error,
    ),
  );
  return promise;
}

async function flushExpectations() {
  while (pendingExpectations.length) {
    const expectations = pendingExpectations.splice(0);
    const results = await Promise.all(expectations);
    const error = results.find((result) => result instanceof Error);
    if (error) throw error;
  }
}

async function discardExpectationsFrom(index: number) {
  const expectations = pendingExpectations.splice(index);
  await Promise.all(expectations);
}

function trackLocatorMatchers<T extends object>(
  locator: Locator,
  matchers: T,
): T {
  return new Proxy(matchers, {
    get(target, property, receiver) {
      if (property === "toMatchInlineSnapshot") {
        const matchers = baseExpect(locator.element());
        return matchers.toMatchInlineSnapshot.bind(matchers);
      }
      if (property === "toMatchSnapshot") {
        const matchers = baseExpect(locator.element());
        return matchers.toMatchSnapshot.bind(matchers);
      }
      const value = Reflect.get(target, property, receiver);
      if (typeof value === "function") {
        return (...args: unknown[]) =>
          enqueueExpectation(Promise.resolve(value.apply(target, args)));
      }
      if (value && typeof value === "object") {
        return trackLocatorMatchers(locator, value);
      }
      return value;
    },
  });
}

function getLocatorExpectOptions(
  options?: ExpectOptions | LocatorExpectOptions,
) {
  const locatorOptions = typeof options === "object" ? options : undefined;
  if (locatorExpectationTimeout == null) return locatorOptions;
  return {
    ...locatorOptions,
    timeout: locatorExpectationTimeout,
  };
}

const expect = ((
  actual: unknown,
  options?: ExpectOptions | LocatorExpectOptions,
) => {
  if (isLocator(actual)) {
    return trackLocatorMatchers(
      actual,
      baseExpect.element(actual, getLocatorExpectOptions(options)),
    );
  }
  return baseExpect(actual, options as ExpectOptions);
}) as typeof baseExpect;

Object.assign(expect, baseExpect);

afterEach(async () => {
  try {
    await flushExpectations();
  } finally {
    lastPointerPosition = null;
    locatorExpectationTimeout = null;
  }
});

function toLocator(target: Target) {
  if (isLocator(target)) return target;
  if (target) return page.elementLocator(target);
  throw new Error("Unable to find element");
}

function toElement(target: Target) {
  if (isLocator(target)) return target.element();
  if (target) return target;
  return null;
}

function getRoleOptions(name?: string | RegExp, options: QueryOptions = {}) {
  const { hidden, includeHidden, exact, ...rest } = options;
  return {
    name,
    exact: exact ?? (typeof name === "string" ? true : undefined),
    includeHidden: includeHidden ?? hidden,
    ...rest,
  } satisfies LocatorByRoleOptions;
}

function getTextOptions(options: TextOptions = {}) {
  return {
    exact: true,
    ...options,
  } satisfies TextOptions;
}

function createRoleQuery(role: AriaRole, root: QueryRoot = page) {
  const getLocator = (name?: string | RegExp, options?: QueryOptions) =>
    root.getByRole(role, getRoleOptions(name, options));
  const getAll = (name?: string | RegExp, options?: QueryOptions) =>
    getLocator(name, options).elements() as HTMLElement[];
  const getAllIncludingHidden = (
    name?: string | RegExp,
    options?: QueryOptions,
  ) => getAll(name, { ...options, includeHidden: true });
  const wait = async (name?: string | RegExp, options?: QueryOptions) => {
    const locator = getLocator(name, options);
    await locator.findElement();
    return locator;
  };
  const waitIncludingHidden = (
    name?: string | RegExp,
    options?: QueryOptions,
  ) => wait(name, { ...options, includeHidden: true });
  const ensure = (name?: string | RegExp, options?: QueryOptions) =>
    getLocator(name, options).element() as HTMLElement;
  const ensureIncludingHidden = (
    name?: string | RegExp,
    options?: QueryOptions,
  ) => ensure(name, { ...options, includeHidden: true });

  return Object.assign(getLocator, {
    includesHidden: (name?: string | RegExp, options?: QueryOptions) =>
      getLocator(name, { ...options, includeHidden: true }),
    all: Object.assign(getAll, {
      includesHidden: getAllIncludingHidden,
      wait: Object.assign(
        async (name?: string | RegExp, options?: QueryOptions) => {
          const locator = await wait(name, options);
          return locator.elements() as HTMLElement[];
        },
        {
          includesHidden: async (
            name?: string | RegExp,
            options?: QueryOptions,
          ) => {
            const locator = await waitIncludingHidden(name, options);
            return locator.elements() as HTMLElement[];
          },
        },
      ),
      ensure: Object.assign(getAll, {
        includesHidden: getAllIncludingHidden,
      }),
    }),
    wait: Object.assign(wait, {
      includesHidden: waitIncludingHidden,
      all: Object.assign(
        async (name?: string | RegExp, options?: QueryOptions) => {
          const locator = await wait(name, options);
          return locator.elements() as HTMLElement[];
        },
        {
          includesHidden: async (
            name?: string | RegExp,
            options?: QueryOptions,
          ) => {
            const locator = await waitIncludingHidden(name, options);
            return locator.elements() as HTMLElement[];
          },
        },
      ),
    }),
    ensure: Object.assign(ensure, {
      includesHidden: ensureIncludingHidden,
      all: Object.assign(getAll, {
        includesHidden: getAllIncludingHidden,
      }),
    }),
  });
}

function createTextQuery(root: QueryRoot = page) {
  const getLocator = (text: string | RegExp, options?: TextOptions) =>
    root.getByText(text, getTextOptions(options));
  const getAll = (text: string | RegExp, options?: TextOptions) =>
    getLocator(text, options).elements() as HTMLElement[];
  const wait = async (text: string | RegExp, options?: TextOptions) => {
    const locator = getLocator(text, options);
    await locator.findElement();
    return locator;
  };
  return Object.assign(getLocator, {
    all: Object.assign(getAll, {
      wait: async (text: string | RegExp, options?: TextOptions) => {
        const locator = await wait(text, options);
        return locator.elements() as HTMLElement[];
      },
      ensure: getAll,
    }),
    wait: Object.assign(wait, {
      all: async (text: string | RegExp, options?: TextOptions) => {
        const locator = await wait(text, options);
        return locator.elements() as HTMLElement[];
      },
    }),
    ensure: Object.assign(
      (text: string | RegExp, options?: TextOptions) =>
        getLocator(text, options).element() as HTMLElement,
      { all: getAll },
    ),
  });
}

function createLabeledQuery(root: QueryRoot = page) {
  const getLocator = (text: string | RegExp, options?: TextOptions) =>
    root.getByLabelText(text, getTextOptions(options));
  const getAll = (text: string | RegExp, options?: TextOptions) =>
    getLocator(text, options).elements() as HTMLElement[];
  const wait = async (text: string | RegExp, options?: TextOptions) => {
    const locator = getLocator(text, options);
    await locator.findElement();
    return locator;
  };
  return Object.assign(getLocator, {
    all: Object.assign(getAll, {
      wait: async (text: string | RegExp, options?: TextOptions) => {
        const locator = await wait(text, options);
        return locator.elements() as HTMLElement[];
      },
      ensure: getAll,
    }),
    wait: Object.assign(wait, {
      all: async (text: string | RegExp, options?: TextOptions) => {
        const locator = await wait(text, options);
        return locator.elements() as HTMLElement[];
      },
    }),
    ensure: Object.assign(
      (text: string | RegExp, options?: TextOptions) =>
        getLocator(text, options).element() as HTMLElement,
      { all: getAll },
    ),
  });
}

function createQueryObject(root: QueryRoot = page): QueryObject {
  const queryObject = roles.reduce(
    (object, role) => {
      object[role] = createRoleQuery(role, root);
      return object;
    },
    {} as Record<AriaRole, RoleQuery>,
  );
  return {
    ...queryObject,
    text: createTextQuery(root),
    labeled: createLabeledQuery(root),
    within(target: Target) {
      return createQueryObject(toLocator(target));
    },
  };
}

const q = createQueryObject();
const query = q;

async function click(target: Target, options?: UserEventClickOptions) {
  await flushExpectations();
  await userEvent.click(toLocator(target), options);
}

function getElementCenter(element: Element): PointerPosition {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function getElementPosition(
  element: Element,
  point: PointerPosition,
): PointerPosition {
  const rect = element.getBoundingClientRect();
  return {
    x: point.x - rect.left,
    y: point.y - rect.top,
  };
}

function getViewportPosition(
  element: Element,
  position: PointerPosition,
): PointerPosition {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + position.x,
    y: rect.top + position.y,
  };
}

function getHoverContext(element: Element, options?: HoverOptions) {
  if (!options) {
    return {
      options: undefined,
      point: getElementCenter(element),
    };
  }

  const { clientX, clientY, movementX, movementY, ...hoverOptions } = options;
  let point: PointerPosition | undefined;
  if (clientX != null || clientY != null) {
    const center = getElementCenter(element);
    point = {
      x: clientX ?? center.x,
      y: clientY ?? center.y,
    };
  } else if (movementX != null || movementY != null) {
    const base = lastPointerPosition ?? getElementCenter(element);
    point = {
      x: base.x + (movementX ?? 0),
      y: base.y + (movementY ?? 0),
    };
  } else if (options.position) {
    point = getViewportPosition(element, options.position);
  }

  if (point) {
    hoverOptions.position = getElementPosition(element, point);
  }

  return {
    options: hoverOptions,
    point,
  };
}

async function hover(target: Target, options?: HoverOptions) {
  await flushExpectations();
  const element = toElement(target);
  if (!element) throw new Error("Unable to hover on null element");
  if (!isVisible(element)) return;
  const context = getHoverContext(element, options);
  await userEvent.hover(toLocator(target), context.options);
  lastPointerPosition = context.point ?? getElementCenter(element);
}

async function focus(target: Target) {
  await flushExpectations();
  const element = toElement(target);
  if (element instanceof HTMLElement || element instanceof SVGElement) {
    element.focus();
  }
}

async function blur(target: Target = document.activeElement) {
  await flushExpectations();
  const element = toElement(target);
  if (element instanceof HTMLElement || element instanceof SVGElement) {
    element.blur();
  }
}

function getKeyboardText(text: string) {
  return Array.from(text, (char) => {
    if (char === "\b") return "{Backspace}";
    if (char === "\x7f") return "{Delete}";
    if (char === "\n") return "{Enter}";
    if (char === "\t") return "{Tab}";
    return char;
  }).join("");
}

function getKeyFromChar(char: string) {
  if (char === "\x7f") return "Delete";
  if (char === "\b") return "Backspace";
  if (char === "\n") return "Enter";
  if (char === "\t") return "Tab";
  return char;
}

function getKeyboardKey(key: string) {
  if (key === " ") return "{Space}";
  return key.length === 1 ? key : `{${key}}`;
}

function withKeyboardModifiers(key: string, options: KeyboardEventInit = {}) {
  const modifiers = [
    options.ctrlKey && "Control",
    options.metaKey && "Meta",
    options.altKey && "Alt",
    options.shiftKey && "Shift",
  ].filter(Boolean);
  const keyboardKey = getKeyboardKey(key);
  const prefix = modifiers.map((modifier) => `{${modifier}>}`).join("");
  const suffix = modifiers.map((modifier) => `{/${modifier}}`).join("");
  return `${prefix}${keyboardKey}${suffix}`;
}

function getTextInput(target: Target) {
  const element = target ? toElement(target) : document.activeElement;
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element;
  }
  return null;
}

async function typeCompositionText(
  text: string,
  target: Target,
  options: KeyboardEventInit = {},
) {
  let element = getTextInput(target);
  if (!element) return;
  await focus(element);
  for (const char of text) {
    const key = getKeyFromChar(char);
    const defaultAllowed = fireEvent.keyDown(element, {
      key,
      ...options,
      isComposing: true,
    });
    element = getTextInput(document.activeElement) ?? element;
    const [start, end] = [
      element.selectionStart ?? 0,
      element.selectionEnd ?? 0,
    ];
    const firstPartEnd = Math.max(start - 1, 0);
    const value = `${element.value.slice(0, firstPartEnd)}${char}${element.value.slice(end)}`;
    const nextCaretPosition = start + 1;
    if (defaultAllowed && !element.readOnly) {
      fireEvent.compositionUpdate(element, { data: char });
      element.value = value;
      element.setSelectionRange(nextCaretPosition, nextCaretPosition);
      fireEvent.input(element, {
        data: char,
        inputType: "insertCompositionText",
        isComposing: true,
      });
    }
    await sleep();
    fireEvent.keyUp(element, { key, ...options, isComposing: true });
    await sleep();
  }
}

async function type(
  text: string,
  target?: Target,
  options: KeyboardEventInit = {},
) {
  await flushExpectations();
  if (target) {
    await focus(target);
  }
  if (options.isComposing) {
    await typeCompositionText(text, target, options);
    return;
  }
  await userEvent.keyboard(getKeyboardText(text));
}

async function press(
  key: string,
  target?: Target,
  options: KeyboardEventInit = {},
) {
  await flushExpectations();
  if (target) await focus(target);
  await userEvent.keyboard(withKeyboardModifiers(key, options));
}

function createPress(key: string, defaultOptions: KeyboardEventInit = {}) {
  return (target?: Target, options: KeyboardEventInit = {}) =>
    press(key, target, { ...defaultOptions, ...options });
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

function createEventTarget(target: Target) {
  const element = toElement(target);
  if (!element) throw new Error("Unable to dispatch event on null element");
  return element;
}

function assignTarget(element: Element, options?: { target?: object }) {
  if (!options?.target) return;
  Object.assign(element, options.target);
}

async function dispatchEvent(
  target: Target,
  type: string,
  options?: EventInit & { target?: object },
) {
  await flushExpectations();
  const element = createEventTarget(target);
  const { target: targetOptions, ...eventOptions } = options ?? {};
  assignTarget(element, { target: targetOptions });
  return fireEvent(
    element,
    new Event(type, { bubbles: true, ...eventOptions }),
  );
}

const dispatch = Object.assign(dispatchEvent, {
  change: async (target: Target, options?: EventInit & { target?: object }) => {
    await flushExpectations();
    const element = createEventTarget(target);
    return fireEvent.change(element, options);
  },
  compositionEnd: async (
    target: Target,
    options?: CompositionEventInit & { target?: object },
  ) => {
    await flushExpectations();
    const element = createEventTarget(target);
    return fireEvent.compositionEnd(element, options);
  },
  compositionStart: async (
    target: Target,
    options?: CompositionEventInit & { target?: object },
  ) => {
    await flushExpectations();
    const element = createEventTarget(target);
    return fireEvent.compositionStart(element, options);
  },
  contextMenu: async (target: Target, options?: MouseEventInit) => {
    await flushExpectations();
    const element = createEventTarget(target);
    return fireEvent.contextMenu(element, options);
  },
  keyDown: async (target: Target, options?: KeyboardEventInit) => {
    await flushExpectations();
    const element = createEventTarget(target);
    return fireEvent.keyDown(element, options);
  },
  keyUp: async (target: Target, options?: KeyboardEventInit) => {
    await flushExpectations();
    const element = createEventTarget(target);
    return fireEvent.keyUp(element, options);
  },
});

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

async function sleep(ms = 150) {
  await flushExpectations();
  await nextFrame();
  await new Promise((resolve) => setTimeout(resolve, ms));
  await nextFrame();
}

async function waitFor<T>(
  callback: () => T | Promise<T>,
  options: { timeout?: number; interval?: number } = {},
) {
  const { timeout = 1000, interval = 20 } = options;
  await flushExpectations();
  const start = Date.now();
  let lastError: unknown;
  while (Date.now() - start < timeout) {
    const expectationIndex = pendingExpectations.length;
    const remaining = Math.max(timeout - (Date.now() - start), 0);
    const previousLocatorExpectationTimeout = locatorExpectationTimeout;
    locatorExpectationTimeout = remaining;
    try {
      const result = await callback();
      await flushExpectations();
      return result;
    } catch (error) {
      lastError = error;
      await discardExpectationsFrom(expectationIndex);
    } finally {
      locatorExpectationTimeout = previousLocatorExpectationTimeout;
    }
    const remainingAfterAttempt = timeout - (Date.now() - start);
    if (remainingAfterAttempt <= 0) break;
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(interval, remainingAfterAttempt)),
    );
  }
  throw lastError;
}

async function select(
  text: string,
  target: Target = document.body,
  options?: PointerEventInit,
) {
  await flushExpectations();
  const element = toElement(target);
  if (!element) throw new Error("Unable to select text on null element");
  if (!isVisible(element)) return;
  const startIndex = element.textContent?.indexOf(text) ?? -1;
  if (startIndex < 0) return;
  const document = element.ownerDocument;
  const selection = document.getSelection();
  const endIndex = startIndex + text.length;
  let charCount = 0;
  let startContainer: Node | null = null;
  let startOffset = -1;
  let endContainer: Node | null = null;
  let endOffset = -1;
  const iterator = document.createNodeIterator(element, NodeFilter.SHOW_TEXT);
  let node: Node | null = null;
  while ((node = iterator.nextNode())) {
    const textContent = node.textContent;
    if (!textContent) continue;
    const nextCount = charCount + textContent.length;
    if (!startContainer && startIndex <= nextCount) {
      startContainer = node;
      startOffset = startIndex - charCount;
    }
    if (endIndex <= nextCount) {
      endContainer = node;
      endOffset = endIndex - charCount;
      break;
    }
    charCount = nextCount;
  }
  if (!startContainer || !endContainer) return;
  const range = document.createRange();
  range.setStart(startContainer, startOffset);
  range.setEnd(endContainer, endOffset);
  const { disabled } = element as HTMLButtonElement;
  await hover(element, options);
  fireEvent.pointerDown(element, options);
  if (!disabled) {
    fireEvent.mouseDown(element, { detail: 1, ...options });
  }
  try {
    fireEvent(
      element,
      new Event("selectstart", {
        bubbles: true,
        cancelable: true,
        composed: false,
      }),
    );
    selection?.removeAllRanges();
    selection?.addRange(range);
    await sleep();
  } finally {
    fireEvent.pointerUp(element, options);
    if (!disabled) {
      fireEvent.mouseUp(element, { detail: 1, ...options });
    }
  }
  fireEvent.click(element, { detail: 1, ...options });
  await sleep();
}

export {
  afterEach,
  beforeEach,
  blur,
  click,
  describe,
  dispatch,
  expect,
  focus,
  hover,
  page,
  press,
  q,
  query,
  select,
  sleep,
  test,
  type,
  userEvent,
  vi,
  waitFor,
};

export type { Locator };
