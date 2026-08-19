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
  return { frameDocument, frameWindow: frameDocument.defaultView };
}

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
// Measured on Chromium 151, Firefox 153, and WebKit 26.5. happy-dom reproduces
// it for `self` and `document` but not for members it defines on the prototype
// chain, so the cases below that need one of those emulate it.
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

// Each helper gets its own case, because a bundled test stops at the first
// failing assertion. `getDocument` and `getActiveElement` also fail differently
// per shape, while `getWindow` reads only `self` and fails the same way in both.
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

test("getDocument falls back when a form answers its owner document with a control", () => {
  const form = document.createElement("form");
  const control = document.createElement("input");
  control.name = "ownerDocument";
  form.append(control);
  document.body.append(form);
  // happy-dom overrides only members it does not define on the prototype chain,
  // so the browsers' answer for the control above is emulated here.
  Object.defineProperty(form, "ownerDocument", {
    configurable: true,
    value: control,
  });

  expect(getDocument(form)).toBe(document);
});

test("getWindow falls back when a document answers its default view with an element", () => {
  const otherDocument = document.implementation.createHTMLDocument("Other");
  const element = otherDocument.createElement("div");
  otherDocument.body.append(element);
  const form = otherDocument.createElement("form");
  form.name = "defaultView";
  otherDocument.body.append(form);
  // `Document` carries the same named-element override, measured on the three
  // engines above: a form named `defaultView` makes the document answer that
  // lookup with the form. happy-dom implements no document named getter, so it
  // is emulated here. This one reaches every caller rather than only the ones
  // handed a form, because `getWindow` resolves through the document.
  Object.defineProperty(otherDocument, "defaultView", {
    configurable: true,
    value: form,
  });

  expect(getWindow(element)).toBe(window);
});

// The same getter answers with a real window when the element it names is a
// frame, so the resolved view has to own the document back rather than merely
// be a window. Measured on the three engines above.
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

// Measured on the same three engines: when that frame is cross-origin, its
// window still answers `window` with itself and throws a `SecurityError` for
// `document`, so refusing to answer has to count as owning another document.
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

test("setSelectionRange skips input types that do not support text selection", () => {
  const color = document.createElement("input");
  color.type = "color";

  expect(() => setSelectionRange(color, 0, 1)).not.toThrow();
});
