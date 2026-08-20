import { afterEach, expect, test, vi } from "vitest";
import {
  getActiveElement,
  getDocument,
  getItemRoleByPopupRole,
  getScrollingElement,
  getTextboxSelection,
  getTextboxValue,
  getWindow,
  isElement,
  isNode,
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

// https://github.com/ariakit/ariakit/issues/7215
test("isElement handles a form that answers nodeType with a control", () => {
  const form = appendShadowingForm(document, "nodeType");
  shadowFormMember(form, "nodeType");

  expect(isElement(form)).toBe(true);
});

// https://github.com/ariakit/ariakit/issues/7215
test("isNode handles a form that answers nodeType with a control", () => {
  const form = appendShadowingForm(document, "nodeType");
  shadowFormMember(form, "nodeType");

  expect(isNode(form)).toBe(true);
});

test("isElement rejects event targets that are not nodes", () => {
  expect(isElement(window)).toBe(false);
  expect(isElement(new EventTarget())).toBe(false);
});

test("isNode rejects event targets that are not nodes", () => {
  expect(isNode(window)).toBe(false);
  expect(isNode(new EventTarget())).toBe(false);
});

test("node guards reject event targets that throw on nodeType", () => {
  const target = new Proxy(new EventTarget(), {
    get(target, property, receiver) {
      if (property === "nodeType") {
        throw new Error("Blocked property");
      }
      return Reflect.get(target, property, receiver);
    },
  });

  expect(isElement(target)).toBe(false);
  expect(isNode(target)).toBe(false);
});

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

// A document names its own elements the same way, so one that names an element
// `nodeType` answers that read with the element. Measured on the three engines
// above; happy-dom implements no document named getter, so it is emulated here.
// Validating through that read would reject the document every element in it
// belongs to. https://github.com/ariakit/ariakit/pull/7213#discussion_r3816584472
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

// https://github.com/ariakit/ariakit/issues/7215
test("getDocument ignores a form's named ownerDocument control", () => {
  const { frameDocument } = appendFrame();
  const form = appendShadowingForm(frameDocument, "ownerDocument");
  // happy-dom overrides only members it does not define on the prototype chain,
  // so the browsers' answer for the control above is emulated here.
  shadowFormMember(form, "ownerDocument");

  expect(getDocument(form)).toBe(frameDocument);
});

// https://github.com/ariakit/ariakit/issues/7215
test("getWindow ignores a document's named defaultView form", () => {
  const { frameDocument, frameWindow } = appendFrame();
  const element = frameDocument.createElement("div");
  frameDocument.body.append(element);
  const form = frameDocument.createElement("form");
  form.name = "defaultView";
  frameDocument.body.append(form);
  // `Document` carries the same named-element override, measured on the three
  // engines above: a form named `defaultView` makes the document answer that
  // lookup with the form. happy-dom implements no document named getter, so it
  // is emulated here. This one reaches every caller rather than only the ones
  // handed a form, because `getWindow` resolves through the document.
  Object.defineProperty(frameDocument, "defaultView", {
    configurable: true,
    value: form,
  });

  expect(getWindow(element)).toBe(frameWindow);
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

test("resolves supplied nodes when imported without DOM globals", async () => {
  const { frameDocument, frameWindow } = appendFrame();
  const form = appendShadowingForm(frameDocument, "nodeType", "ownerDocument");
  shadowFormMember(form, "nodeType");
  shadowFormMember(form, "ownerDocument");
  const globalNames = ["window", "document", "Node", "Document"] as const;
  const descriptors = globalNames.map(
    (name) =>
      [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const,
  );

  try {
    for (const name of globalNames) {
      Reflect.deleteProperty(globalThis, name);
    }
    vi.resetModules();
    const dom = await import("./dom.ts");

    expect(dom.isElement(form)).toBe(true);
    expect(dom.isNode(form)).toBe(true);
    expect(dom.getDocument(form)).toBe(frameDocument);
    expect(dom.getWindow(form)).toBe(frameWindow);
  } finally {
    for (const [name, descriptor] of descriptors) {
      if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor);
      }
    }
    vi.resetModules();
  }
});

test("setSelectionRange skips input types that do not support text selection", () => {
  const color = document.createElement("input");
  color.type = "color";

  expect(() => setSelectionRange(color, 0, 1)).not.toThrow();
});
