import { expect, onTestFinished, test, vi } from "vitest";
import {
  fireBlurEvent,
  fireClickEvent,
  fireEvent,
  fireFocusEvent,
  fireKeyboardEvent,
  isFocusEventOutside,
  isInputEvent,
  isPortalEvent,
  queueBeforeEvent,
} from "./events.ts";

// Regression tests for https://github.com/ariakit/ariakit/issues/5156: a
// programmatically dispatched event can carry a non-node target/relatedTarget
// (e.g. window or an XMLHttpRequest), which used to make these helpers call
// `contains()` on a non-node and throw "parameter 1 is not of type 'Node'".

test("isFocusEventOutside treats a non-node relatedTarget as outside", () => {
  const container = document.createElement("div");
  const event = { currentTarget: container, relatedTarget: new EventTarget() };
  expect(() => isFocusEventOutside(event)).not.toThrow();
  expect(isFocusEventOutside(event)).toBe(true);
});

test("isPortalEvent treats a non-node target as a portal event", () => {
  const container = document.createElement("div");
  const event = { currentTarget: container, target: new EventTarget() };
  expect(() => isPortalEvent(event)).not.toThrow();
  expect(isPortalEvent(event)).toBe(true);
});

// Non-element nodes (such as text nodes, which a programmatically dispatched
// event can carry) are still passed to `contains`, preserving the original
// behavior rather than being rejected like a non-node target.

test("isFocusEventOutside keeps a contained text-node relatedTarget inside", () => {
  const container = document.createElement("div");
  const text = container.appendChild(document.createTextNode("hi"));
  const event = { currentTarget: container, relatedTarget: text };
  expect(isFocusEventOutside(event)).toBe(false);
});

test("isPortalEvent keeps a contained text-node target as non-portal", () => {
  const container = document.createElement("div");
  const text = container.appendChild(document.createTextNode("hi"));
  const event = { currentTarget: container, target: text };
  expect(isPortalEvent(event)).toBe(false);
});

test("isInputEvent checks input events", () => {
  expect(isInputEvent(new InputEvent("input"))).toBe(true);
  expect(isInputEvent(new Event("change"))).toBe(false);
});

// See https://github.com/ariakit/ariakit/issues/6350

function expectCancelToRemoveQueuedEventListener(timeout?: number) {
  vi.useFakeTimers();

  try {
    const container = document.createElement("div");
    const callback = vi.fn();
    const cancel = queueBeforeEvent(container, "mousedown", callback, timeout);

    cancel();
    container.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    vi.runAllTimers();

    expect(callback).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
}

test("queueBeforeEvent cancel removes the queued animation frame listener", () => {
  expectCancelToRemoveQueuedEventListener();
});

test("queueBeforeEvent cancel removes the queued timeout listener", () => {
  expectCancelToRemoveQueuedEventListener(1_000);
});

// https://github.com/ariakit/ariakit/issues/7171
//
// Measured on Chromium 151, Firefox 153, and WebKit 26.5: a click no pointer
// caused, such as the one `Command` synthesizes for Enter and Space, is a
// `PointerEvent` reporting `pointerId: -1` and an empty `pointerType`.

function captureClick(
  element: HTMLElement,
  eventInit?: PointerEventInit | null,
) {
  let clicked: PointerEvent | undefined;
  element.addEventListener("click", (event) => {
    clicked = event;
  });
  fireClickEvent(element, eventInit);
  return clicked;
}

test("fireClickEvent dispatches a PointerEvent with no pointer behind it", () => {
  const clicked = captureClick(document.createElement("button"));
  expect(clicked).toBeInstanceOf(PointerEvent);
  expect(clicked?.pointerId).toBe(-1);
  expect(clicked?.pointerType).toBe("");
});

test("fireClickEvent keeps the pointer members the caller passes", () => {
  const clicked = captureClick(document.createElement("button"), {
    pointerId: 7,
    pointerType: "pen",
  });
  expect(clicked?.pointerId).toBe(7);
  expect(clicked?.pointerType).toBe("pen");
});

// https://github.com/ariakit/ariakit/issues/7199
//
// Pointer Events resets every pointer attribute other than `pointerId` and
// `pointerType` on a click, so the contact a press described never reaches it.
// The expected values come from a default-constructed event rather than
// literals, because the specification's defaults are not all zero and a DOM
// implementation may not have caught up with them.
//
// `persistentDeviceId` is reset too but cannot be asserted here, because
// happy-dom doesn't implement it. Chromium 151 and Firefox 153 were measured
// leaking a caller's value onto the click without the reset.
test("fireClickEvent resets the pointer contact the caller passes", () => {
  const defaults = new PointerEvent("click");
  const clicked = captureClick(document.createElement("button"), {
    pointerId: 7,
    pointerType: "pen",
    pressure: 0.5,
    tangentialPressure: 0.25,
    width: 3,
    height: 4,
    tiltX: 30,
    tiltY: 20,
    twist: 90,
    altitudeAngle: 1.2,
    azimuthAngle: 0.5,
    isPrimary: true,
    coalescedEvents: [new PointerEvent("pointermove")],
    predictedEvents: [new PointerEvent("pointermove")],
  });
  expect(clicked?.pointerId).toBe(7);
  expect(clicked?.pointerType).toBe("pen");
  expect(clicked?.pressure).toBe(defaults.pressure);
  expect(clicked?.tangentialPressure).toBe(defaults.tangentialPressure);
  expect(clicked?.width).toBe(defaults.width);
  expect(clicked?.height).toBe(defaults.height);
  expect(clicked?.tiltX).toBe(defaults.tiltX);
  expect(clicked?.tiltY).toBe(defaults.tiltY);
  expect(clicked?.twist).toBe(defaults.twist);
  expect(clicked?.altitudeAngle).toBe(defaults.altitudeAngle);
  expect(clicked?.azimuthAngle).toBe(defaults.azimuthAngle);
  expect(clicked?.isPrimary).toBe(defaults.isPrimary);
  expect(clicked?.getCoalescedEvents()).toHaveLength(0);
  expect(clicked?.getPredictedEvents()).toHaveLength(0);
});

// The sibling helpers pass a `null` init straight to a constructor, which reads
// it as an empty dictionary, so this one has to keep accepting it too.
test("fireClickEvent accepts a null init", () => {
  const clicked = captureClick(document.createElement("button"), null);
  expect(clicked).toBeInstanceOf(PointerEvent);
  expect(clicked?.pointerId).toBe(-1);
});

// `0` is a valid pointer identity, so the fallback has to distinguish it from a
// missing member rather than treat it as absent.
test("fireClickEvent keeps a zero pointerId the caller passes", () => {
  const clicked = captureClick(document.createElement("button"), {
    pointerId: 0,
  });
  expect(clicked?.pointerId).toBe(0);
});

// `getWindow` treats any node with a `self` property as a window, and a form
// exposes its controls as named properties, so the window has to come from the
// document instead.
test("fireClickEvent dispatches on a form owning a control named self", () => {
  const form = document.createElement("form");
  const control = document.createElement("input");
  control.name = "self";
  form.append(control);
  document.body.append(form);
  onTestFinished(() => form.remove());
  // Without the named property there is nothing for the helper to trip over,
  // and this would pass whichever window it read.
  expect(Reflect.get(form, "self")).toBe(control);

  const clicked = captureClick(form);

  expect(clicked).toBeInstanceOf(PointerEvent);
  expect(clicked?.pointerId).toBe(-1);
});

// The init the constructor reads is layered over a fresh object, because a
// proxy may not report a value different from a frozen own property of its
// target, and every layered member could be one.
test("fireClickEvent accepts a frozen init", () => {
  const defaults = new PointerEvent("click");
  const clicked = captureClick(
    document.createElement("button"),
    Object.freeze({ ctrlKey: true, pressure: 0.5 }),
  );
  expect(clicked?.ctrlKey).toBe(true);
  expect(clicked?.pressure).toBe(defaults.pressure);
  expect(clicked?.pointerId).toBe(-1);
});

test("fireClickEvent reports no pointer for members passed as undefined", () => {
  const clicked = captureClick(document.createElement("button"), {
    pointerId: undefined,
    pointerType: undefined,
  });
  expect(clicked?.pointerId).toBe(-1);
  expect(clicked?.pointerType).toBe("");
});

// `Command` passes the key event's own members through this helper, so a click
// handler can tell an open-in-new-tab or download activation from a plain one.
// This one passes before the fix too. It is here so the new init merge cannot
// drop those members, not to reproduce the reported bug.
test("fireClickEvent keeps the event members the caller passes", () => {
  const clicked = captureClick(document.createElement("button"), {
    altKey: true,
    bubbles: true,
    cancelable: true,
    ctrlKey: true,
    detail: 1,
    metaKey: true,
    shiftKey: true,
  });
  expect(clicked?.altKey).toBe(true);
  expect(clicked?.ctrlKey).toBe(true);
  expect(clicked?.metaKey).toBe(true);
  expect(clicked?.shiftKey).toBe(true);
  expect(clicked?.bubbles).toBe(true);
  expect(clicked?.cancelable).toBe(true);
  expect(clicked?.detail).toBe(1);
});

// A live event keeps most of its members on a prototype rather than on itself,
// so the init has to reach the constructor through the prototype chain. Copying
// it would forward little in a browser and, even here, would lose `bubbles` and
// `cancelable`.
test("fireClickEvent forwards the members of a live event passed as the init", () => {
  const source = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    ctrlKey: true,
    detail: 3,
  });
  const clicked = captureClick(document.createElement("button"), source);
  expect(clicked?.ctrlKey).toBe(true);
  expect(clicked?.detail).toBe(3);
  expect(clicked?.bubbles).toBe(true);
  expect(clicked?.cancelable).toBe(true);
  expect(clicked?.pointerId).toBe(-1);
});

// happy-dom gives a frame its own `Window` but the same `PointerEvent` as its
// parent, so an ambient-global implementation would satisfy a plain
// `instanceof` check here. Replacing the constructor on the frame's window
// alone makes the two distinguishable: only an implementation that reads the
// element's own window builds the subclass.
function appendFrameButton() {
  const frame = document.createElement("iframe");
  document.body.append(frame);
  onTestFinished(() => frame.remove());
  const frameDocument = frame.contentDocument;
  if (!frameDocument) throw new Error("iframe document is not available");
  const view = frameDocument.defaultView;
  if (!view) throw new Error("iframe window is not available");
  const button = frameDocument.body.appendChild(
    frameDocument.createElement("button"),
  );
  return { button, view };
}

test("fireClickEvent builds the event with the element's own window", () => {
  const { button, view } = appendFrameButton();
  const ambientPointerEvent = view.PointerEvent;
  class FramePointerEvent extends ambientPointerEvent {}
  view.PointerEvent = FramePointerEvent;
  onTestFinished(() => {
    view.PointerEvent = ambientPointerEvent;
  });

  const clicked = captureClick(button, { ctrlKey: true });

  expect(clicked).toBeInstanceOf(FramePointerEvent);
  expect(clicked?.pointerId).toBe(-1);
  expect(clicked?.ctrlKey).toBe(true);
});

// https://github.com/ariakit/ariakit/issues/7192
test("fireClickEvent uses the element's window as the view and composes the click", () => {
  const { button, view } = appendFrameButton();

  const clicked = captureClick(button, { composed: false, view: window });

  expect(clicked?.view).toBe(view);
  expect(clicked?.composed).toBe(true);
});

// https://github.com/ariakit/ariakit/issues/7395
test("fireClickEvent omits a view that is not a Window instance", () => {
  const otherDocument = document.implementation.createHTMLDocument("Other");
  const button = otherDocument.body.appendChild(
    otherDocument.createElement("button"),
  );
  const view = {
    document: otherDocument,
    MouseEvent,
    PointerEvent,
    Window,
  };
  Object.defineProperty(view, "window", { value: view });
  Object.defineProperty(otherDocument, "defaultView", {
    configurable: true,
    value: view,
  });

  const clicked = captureClick(button);

  expect(clicked).toBeInstanceOf(PointerEvent);
  expect(clicked?.view).toBe(null);
});

test("fireClickEvent omits a view without a Window constructor", () => {
  const otherDocument = document.implementation.createHTMLDocument("Other");
  const button = otherDocument.body.appendChild(
    otherDocument.createElement("button"),
  );
  const view = {
    document: otherDocument,
    MouseEvent,
    PointerEvent,
  };
  Object.defineProperty(view, "window", { value: view });
  Object.defineProperty(otherDocument, "defaultView", {
    configurable: true,
    value: view,
  });

  const clicked = captureClick(button);

  expect(clicked).toBeInstanceOf(PointerEvent);
  expect(clicked?.view).toBe(null);
});

// jsdom implements `PointerEvent` only from v27, so `jest-environment-jsdom` 30
// still has none. Activation has to keep working there rather than throwing,
// dropping only the pointer members.
test("fireClickEvent falls back to MouseEvent where PointerEvent is missing", () => {
  const { button, view } = appendFrameButton();
  const framePointerEvent = view.PointerEvent;
  Reflect.deleteProperty(view, "PointerEvent");
  onTestFinished(() => {
    view.PointerEvent = framePointerEvent;
  });

  const clicked = captureClick(button, { ctrlKey: true });

  expect(clicked).toBeInstanceOf(view.MouseEvent);
  expect(clicked).not.toBeInstanceOf(framePointerEvent);
  expect(clicked?.ctrlKey).toBe(true);
});

// The remaining helpers have to read the same window `fireClickEvent` does, or
// a listener inside a same-origin frame gets an event that fails `instanceof`
// against its own interfaces. They tell the two realms apart the same way the
// two tests above do. https://github.com/ariakit/ariakit/issues/7193

function captureEvents(element: Element, ...types: string[]) {
  const received: Event[] = [];
  for (const type of types) {
    element.addEventListener(type, (event) => received.push(event));
  }
  return received;
}

test("fireEvent builds the event with the element's own window", () => {
  const { button, view } = appendFrameButton();
  const frameEvent = view.Event;
  class SubclassedEvent extends frameEvent {}
  view.Event = SubclassedEvent;
  onTestFinished(() => {
    view.Event = frameEvent;
  });
  const received = captureEvents(button, "mouseout");

  fireEvent(button, "mouseout");

  expect(received).toHaveLength(1);
  expect(received[0]).toBeInstanceOf(SubclassedEvent);
});

test("fireBlurEvent builds both events with the element's own window", () => {
  const { button, view } = appendFrameButton();
  const frameFocusEvent = view.FocusEvent;
  class SubclassedFocusEvent extends frameFocusEvent {}
  view.FocusEvent = SubclassedFocusEvent;
  onTestFinished(() => {
    view.FocusEvent = frameFocusEvent;
  });
  const received = captureEvents(button, "blur", "focusout");

  fireBlurEvent(button);

  expect(received.map((event) => event.type)).toEqual(["blur", "focusout"]);
  for (const event of received) {
    expect(event).toBeInstanceOf(SubclassedFocusEvent);
  }
});

test("fireFocusEvent builds both events with the element's own window", () => {
  const { button, view } = appendFrameButton();
  const frameFocusEvent = view.FocusEvent;
  class SubclassedFocusEvent extends frameFocusEvent {}
  view.FocusEvent = SubclassedFocusEvent;
  onTestFinished(() => {
    view.FocusEvent = frameFocusEvent;
  });
  const received = captureEvents(button, "focus", "focusin");

  fireFocusEvent(button);

  expect(received.map((event) => event.type)).toEqual(["focus", "focusin"]);
  for (const event of received) {
    expect(event).toBeInstanceOf(SubclassedFocusEvent);
  }
});

test("fireKeyboardEvent builds the event with the element's own window", () => {
  const { button, view } = appendFrameButton();
  const frameKeyboardEvent = view.KeyboardEvent;
  class SubclassedKeyboardEvent extends frameKeyboardEvent {}
  view.KeyboardEvent = SubclassedKeyboardEvent;
  onTestFinished(() => {
    view.KeyboardEvent = frameKeyboardEvent;
  });
  const received = captureEvents(button, "keydown");

  fireKeyboardEvent(button, "keydown", { key: "ArrowDown" });

  expect(received).toHaveLength(1);
  expect(received[0]).toBeInstanceOf(SubclassedKeyboardEvent);
});

// `Document` exposes named elements as its own properties, so a form named
// `defaultView` answers the lookup that resolves the window. Reading that
// member without checking what came back leaves no constructor to build the
// click with. https://github.com/ariakit/ariakit/issues/7201
test("fireClickEvent falls back when a document answers its default view with an element", () => {
  const otherDocument = document.implementation.createHTMLDocument("Other");
  const button = otherDocument.body.appendChild(
    otherDocument.createElement("button"),
  );
  const form = otherDocument.createElement("form");
  form.name = "defaultView";
  otherDocument.body.append(form);
  Object.defineProperty(otherDocument, "defaultView", {
    configurable: true,
    value: form,
  });
  const received = captureEvents(button, "click");

  fireClickEvent(button);

  expect(received).toHaveLength(1);
  expect(received[0]).toBeInstanceOf(PointerEvent);
});
