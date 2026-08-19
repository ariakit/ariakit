import { afterEach, expect, test } from "vitest";
import { getOwnerWindow, wrapAsync } from "./__utils.ts";

afterEach(() => {
  document.body.replaceChildren();
});

// Resolving the realm by reading one member is only safe while nothing shadows
// it. A form exposes its controls as named properties, and browsers let those
// override built-ins, so a control named `ownerDocument` answers the lookup this
// helper starts from. Measured on Chromium 151, Firefox 153, and WebKit 26.5;
// happy-dom defines `ownerDocument` on the prototype chain, so it is emulated.
// https://github.com/ariakit/ariakit/issues/7209
test("getOwnerWindow resolves a form whose control answers the owner document", () => {
  const form = document.createElement("form");
  const control = document.createElement("input");
  control.name = "ownerDocument";
  form.append(control);
  document.body.append(form);
  Object.defineProperty(form, "ownerDocument", {
    configurable: true,
    value: control,
  });

  expect(getOwnerWindow(form)).toBe(window);
});

// Both callers use the absent result to fall back, so it has to stay absent for
// a target with no view of its own rather than becoming the ambient window.
test("getOwnerWindow reports no window for a document with no view", () => {
  const otherDocument = document.implementation.createHTMLDocument("Other");
  const element = otherDocument.createElement("div");
  otherDocument.body.append(element);

  expect(getOwnerWindow(element)).toBeNull();
});

// `Document` exposes named elements as its own properties too, so the view a
// document answers with has to own it back rather than merely be a window: the
// same getter answers with a real window when the element it names is a frame.
// https://github.com/ariakit/ariakit/issues/7209
test("getOwnerWindow reports no window when a document answers its default view with another realm's window", () => {
  const frame = document.createElement("iframe");
  document.body.append(frame);
  const frameWindow = frame.contentDocument?.defaultView;
  if (!frameWindow) throw new Error("iframe window is not available");
  const otherDocument = document.implementation.createHTMLDocument("Other");
  const element = otherDocument.createElement("div");
  otherDocument.body.append(element);
  Object.defineProperty(otherDocument, "defaultView", {
    configurable: true,
    value: frameWindow,
  });

  expect(getOwnerWindow(element)).toBeNull();
});

test("getOwnerWindow reports no window when a document answers its default view with an element", () => {
  const otherDocument = document.implementation.createHTMLDocument("Other");
  const element = otherDocument.createElement("div");
  otherDocument.body.append(element);
  const form = otherDocument.createElement("form");
  form.name = "defaultView";
  otherDocument.body.append(form);
  Object.defineProperty(otherDocument, "defaultView", {
    configurable: true,
    value: form,
  });

  expect(getOwnerWindow(element)).toBeNull();
});

test("wrapAsync does not reapply the act environment when nested", async () => {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "IS_REACT_ACT_ENVIRONMENT",
  );
  const values: Array<boolean | undefined> = [];
  let value: boolean | undefined = true;

  Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
    configurable: true,
    get: () => value,
    set: (nextValue: boolean | undefined) => {
      values.push(nextValue);
      value = nextValue;
    },
  });

  try {
    await wrapAsync(async () => {
      await wrapAsync(async () => {});
    });

    expect(values).toEqual([false, true]);
  } finally {
    if (descriptor) {
      Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", descriptor);
    } else {
      delete scope.IS_REACT_ACT_ENVIRONMENT;
    }
  }
});
