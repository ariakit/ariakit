import { afterEach, expect, test } from "vitest";
import {
  getActiveElement,
  getDocument,
  getItemRoleByPopupRole,
  getScrollingElement,
  getTextboxSelection,
  getTextboxValue,
  getWindow,
  isTextField,
  setSelectionRange,
} from "./dom.ts";

afterEach(() => {
  document.body.replaceChildren();
  document.getSelection()?.removeAllRanges();
});

test("detects text fields without throwing for unsupported inputs", () => {
  const text = document.createElement("input");
  text.type = "text";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  const textarea = document.createElement("textarea");

  expect(isTextField(text)).toBe(true);
  expect(isTextField(checkbox)).toBe(false);
  expect(isTextField(textarea)).toBe(true);
});

test("gets item roles by popup role", () => {
  expect(getItemRoleByPopupRole("menu")).toBe("menuitem");
  expect(getItemRoleByPopupRole("listbox")).toBe("option");
  expect(getItemRoleByPopupRole("tree")).toBe("treeitem");
  expect(getItemRoleByPopupRole("dialog")).toBeUndefined();
  expect(getItemRoleByPopupRole("toString")).toBeUndefined();
});

test("reads selection offsets from text fields", () => {
  const input = document.createElement("input");
  input.value = "abcdef";
  document.body.append(input);

  setSelectionRange(input, 2, 5);

  expect(getTextboxValue(input)).toBe("abcdef");
  expect(getTextboxSelection(input)).toEqual({ start: 2, end: 5 });
});

test("reads selection offsets from contenteditable elements", () => {
  const editor = document.createElement("div");
  editor.textContent = "hello world";
  Object.defineProperty(editor, "isContentEditable", {
    configurable: true,
    value: true,
  });
  document.body.append(editor);

  const text = editor.firstChild;
  expect(text).toBeInstanceOf(Text);
  if (!text) {
    throw new Error("Expected contenteditable text node");
  }

  const range = document.createRange();
  range.setStart(text, 3);
  range.setEnd(text, 8);
  document.getSelection()?.addRange(range);

  expect(getTextboxValue(editor)).toBe("hello world");
  expect(getTextboxSelection(editor)).toEqual({ start: 3, end: 8 });
});

function appendFrame() {
  const iframe = document.createElement("iframe");
  document.body.append(iframe);
  const frameDocument = iframe.contentDocument;
  if (!frameDocument?.body || !frameDocument.defaultView) {
    throw new Error("Expected a same-origin frame document");
  }
  return { iframe, frameDocument, frameWindow: frameDocument.defaultView };
}

// A browser represents focus inside a frame as the frame element in the parent
// document, so a caller deciding ownership there must be able to stop at its
// own document. happy-dom does not propagate the inner focus to the parent, so
// the frame element is focused explicitly to reach the same state.
test("getActiveElement resolves through a focused frame unless it is turned off", () => {
  const { iframe, frameDocument } = appendFrame();
  const button = frameDocument.createElement("button");
  frameDocument.body.append(button);
  iframe.focus();
  button.focus();

  expect(getActiveElement(document.body)).toBe(button);
  expect(getActiveElement(document.body, { frame: false })).toBe(iframe);
});

test("getActiveElement resolves aria-activedescendant only when asked", () => {
  const composite = document.createElement("div");
  composite.tabIndex = 0;
  const item = document.createElement("div");
  item.id = "active-item";
  composite.setAttribute("aria-activedescendant", item.id);
  document.body.append(composite, item);
  composite.focus();

  expect(getActiveElement(composite)).toBe(composite);
  expect(getActiveElement(composite, { activeDescendant: true })).toBe(item);
});

test("getScrollingElement falls back to the element's own document, not the global one", () => {
  const { frameDocument } = appendFrame();

  // The element lives inside the iframe with no in-frame overflow container, so
  // the ancestor walk bottoms out at the document fallback. That fallback must
  // resolve against the iframe's own document, not the top-level page's.
  const item = frameDocument.createElement("div");
  frameDocument.body.append(item);

  const scroller = getScrollingElement(item);
  expect(scroller?.ownerDocument).toBe(frameDocument);
});

// A form's named-element getter overrides built-ins, so a control named after
// the member a helper reads makes the form answer with that control instead.
// happy-dom reproduces that for some names and not others, and implements no
// document named getter, so the cases it cannot produce use `defineProperty` to
// stand in for the own property a browser exposes.
// https://github.com/ariakit/ariakit/issues/7201

function appendShadowingForm(
  ownerDocument: Document,
  ...controlNames: string[]
) {
  const form = ownerDocument.createElement("form");
  for (const name of controlNames) {
    const control = ownerDocument.createElement("input");
    control.name = name;
    form.append(control);
  }
  ownerDocument.body.append(form);
  return form;
}

function shadowFormMember(form: HTMLFormElement, name: string) {
  const control = form.querySelector(`[name="${name}"]`);
  if (!control) {
    throw new Error(`Expected a control named ${name}`);
  }
  Object.defineProperty(form, name, {
    configurable: true,
    value: control,
  });
}

// The realm is no longer resolved through a prototype read, so a form whose
// control is named `ownerDocument` resolves to the ambient document rather than
// its own. What still has to hold is that the control never stands in for a
// document, because callers destructure `documentElement` off the result.
// happy-dom defines `ownerDocument` on the prototype chain, so the browsers'
// answer for the control is emulated here.
test("getDocument falls back when a form answers ownerDocument with a control", () => {
  const form = appendShadowingForm(document, "ownerDocument");
  shadowFormMember(form, "ownerDocument");

  expect(getDocument(form)).toBe(document);
});

// Each helper gets its own case, because a bundled test stops at the first
// failing assertion. No helper reads `self` or `document` off the value it is
// handed, since `isWindow` compares identity through `window`, and `.document`
// is only read once a value is known to be a window; these names guard against
// a regression to the member reads they replaced.
const shadowingForms = [
  { controlNames: ["self"], label: "a control named self" },
  {
    controlNames: ["self", "document"],
    label: "controls named self and document",
  },
];

test.each(shadowingForms)(
  "getDocument handles a form with $label",
  ({ controlNames }) => {
    const form = appendShadowingForm(document, ...controlNames);

    expect(getDocument(form)).toBe(document);
  },
);

test.each(shadowingForms)(
  "getWindow handles a form with $label",
  ({ controlNames }) => {
    const form = appendShadowingForm(document, ...controlNames);

    expect(getWindow(form)).toBe(window);
  },
);

test.each(shadowingForms)(
  "getActiveElement handles a form with $label",
  ({ controlNames }) => {
    const button = document.createElement("button");
    document.body.append(button);
    const form = appendShadowingForm(document, ...controlNames);
    button.focus();

    expect(getActiveElement(form)).toBe(button);
  },
);

// Resolving through the frame is what makes a wrong answer visible: in the
// ambient realm the fallback happens to be correct, so a helper that resolves
// the realm from the wrong member still looks right. The `window` control is
// what a fix that swapped one member name for another would read.
test("getDocument resolves a shadowing form to its own frame's document", () => {
  const { frameDocument } = appendFrame();
  const form = appendShadowingForm(frameDocument, "self", "window");

  expect(getDocument(form)).toBe(frameDocument);
});

test("getWindow resolves a shadowing form to its own frame's view", () => {
  const { frameDocument, frameWindow } = appendFrame();
  const form = appendShadowingForm(frameDocument, "self", "window");

  expect(getWindow(form)).toBe(frameWindow);
});

// The window branch is the one the discriminator rewrites, so it needs its own
// case: dropping it entirely would leave every test above passing.
test("getDocument resolves a window to its own document", () => {
  const { frameDocument, frameWindow } = appendFrame();

  expect(getDocument(frameWindow)).toBe(frameDocument);
});

test("getWindow resolves a window to itself", () => {
  const { frameWindow } = appendFrame();

  expect(getWindow(frameWindow)).toBe(frameWindow);
});

// A document's named getter answers with a real window when the element it
// names is a frame, so the resolved view has to own the document back rather
// than merely be a window.
test("getWindow falls back when a document answers its default view with another realm's window", () => {
  const { frameWindow } = appendFrame();
  const otherDocument = document.implementation.createHTMLDocument("Other");
  const element = otherDocument.createElement("div");
  otherDocument.body.append(element);
  Object.defineProperty(otherDocument, "defaultView", {
    configurable: true,
    value: frameWindow,
  });

  expect(getWindow(element)).toBe(window);
});

// When that frame is cross-origin, its window still answers `window` with
// itself and throws a `SecurityError` for `document`, so refusing to answer has
// to count as owning another document.
// The environment has no cross-origin frames, so the refusal is emulated.
test("getWindow falls back when the view it resolves refuses to report its document", () => {
  const refusingView = {
    window: null as unknown,
    get document(): Document {
      throw new Error("SecurityError");
    },
  };
  refusingView.window = refusingView;
  const otherDocument = document.implementation.createHTMLDocument("Other");
  const element = otherDocument.createElement("div");
  otherDocument.body.append(element);
  Object.defineProperty(otherDocument, "defaultView", {
    configurable: true,
    value: refusingView,
  });

  expect(getWindow(element)).toBe(window);
});

// Validating through the read a named element answers would reject the document
// every element in it belongs to, which is why `isDocument` takes the accessor.
// https://github.com/ariakit/ariakit/pull/7213#discussion_r3816584472
test("getDocument resolves an element whose document answers nodeType with an element", () => {
  const otherDocument = document.implementation.createHTMLDocument("Other");
  const element = otherDocument.createElement("div");
  otherDocument.body.append(element);
  const form = otherDocument.createElement("form");
  form.name = "nodeType";
  otherDocument.body.append(form);
  Object.defineProperty(otherDocument, "nodeType", {
    configurable: true,
    value: form,
  });

  expect(getDocument(element)).toBe(otherDocument);
});

// A `Document` is a `Node` whose `ownerDocument` is `null`, so resolving one
// through that member falls through to the ambient document. Measured on
// Chromium 151, Firefox 153, and WebKit 26.5: both helpers report the top-level
// page for a document that belongs to a frame.
// https://github.com/ariakit/ariakit/issues/7206

test("getDocument resolves a document from another realm to itself", () => {
  const { frameDocument } = appendFrame();

  expect(getDocument(frameDocument)).toBe(frameDocument);
});

test("getWindow resolves a document from another realm to its own view", () => {
  const { frameDocument, frameWindow } = appendFrame();

  expect(getWindow(frameDocument)).toBe(frameWindow);
});

// A named form and the focused element are both elements, so no value tells
// them apart and `getActiveElement` reads the accessor instead.
// https://github.com/ariakit/ariakit/issues/7228#issuecomment-5359605589
test("getActiveElement ignores a document's named activeElement form", () => {
  const { frameDocument } = appendFrame();
  const button = frameDocument.createElement("button");
  frameDocument.body.append(button);
  const form = frameDocument.createElement("form");
  form.name = "activeElement";
  frameDocument.body.append(form);
  button.focus();
  Object.defineProperty(frameDocument, "activeElement", {
    configurable: true,
    value: form,
  });

  expect(getActiveElement(button)).toBe(button);
});

test("setSelectionRange skips input types that do not support text selection", () => {
  const color = document.createElement("input");
  color.type = "color";

  expect(() => setSelectionRange(color, 0, 1)).not.toThrow();
});
