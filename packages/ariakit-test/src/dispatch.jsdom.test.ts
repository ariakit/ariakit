// @vitest-environment jsdom

import { expect, test } from "vitest";
import { dispatch } from "./index.ts";

// A same-origin iframe, whose document is a realm of its own. jsdom builds
// distinct constructors per realm, and happy-dom shares the parent's, so the
// cross-realm tests below can only run here.
function createIframeButton() {
  const iframe = document.createElement("iframe");
  document.body.append(iframe);
  // Reached through the document rather than `contentWindow`, which lib.dom
  // types as a bare `Window` without the constructors this fixture compares.
  const iframeWindow = iframe.contentDocument?.defaultView;
  if (!iframeWindow) throw new Error("Unable to reach the iframe window");
  const button = iframeWindow.document.createElement("button");
  iframeWindow.document.body.append(button);
  return {
    iframeWindow,
    button,
    [Symbol.dispose]() {
      iframe.remove();
    },
  };
}

// `createEvent` resolves the constructor from the target's own window, so an
// event dispatched at a node inside an iframe is built in that realm and matches
// none of the ambient `instanceof` tests `initEvent` picked its initializers
// with. Every member only an initializer assigns was left undefined.
//
// These two types prove it because neither is reached by a name. The type
// fallbacks cover the drag events and `wheel` (`mouseDerivedEventTypes`), the
// pointer and click families (`pointerEventTypes`), and the three composition
// names (`compositionEventTypes`), so `keydown` and `mousedown` are reached by
// the realm-resolved interface test alone. Measured on this fixture, `mouseup`
// and `mousemove` behave the same way.
// https://github.com/ariakit/ariakit/issues/7195
test.each([
  ["keyDown", "keydown"],
  ["mouseDown", "mousedown"],
] as const)(
  "dispatch.%s initializes an event dispatched inside an iframe",
  async (dispatcher, type) => {
    using fixture = createIframeButton();
    const { button, iframeWindow } = fixture;
    let event: KeyboardEvent | MouseEvent | undefined;
    button.addEventListener(type, (receivedEvent) => {
      event = receivedEvent;
    });
    await dispatch[dispatcher](button, {
      // jsdom is the only environment that reports this modifier, so a false
      // answer is what separates the `initUIEventModifiers` table from jsdom's
      // own constructor. https://github.com/ariakit/ariakit/issues/7166
      modifierHyper: true,
      modifierCapsLock: true,
    });
    expect({
      // Pinned so the test cannot pass by the event ceasing to be cross-realm.
      ambientInstance: event instanceof UIEvent,
      iframeInstance: event instanceof iframeWindow.UIEvent,
      hyper: event?.getModifierState("Hyper"),
      capsLock: event?.getModifierState("CapsLock"),
      view: event?.view,
      detail: event?.detail,
    }).toEqual({
      ambientInstance: false,
      iframeInstance: true,
      hyper: false,
      capsLock: true,
      view: null,
      detail: 0,
    });
  },
);

// The other two target shapes `dispatch` accepts. Each resolves the realm
// through a branch of its own, and a resolution that failed for either would
// fall back to the ambient globals, which are the wrong realm here.
test.each(["document", "window"] as const)(
  "dispatch.keyDown initializes an event dispatched at an iframe %s",
  async (shape) => {
    using fixture = createIframeButton();
    const { iframeWindow } = fixture;
    const target = shape === "document" ? iframeWindow.document : iframeWindow;
    let event: KeyboardEvent | undefined;
    const listener = (receivedEvent: Event) => {
      event = receivedEvent as KeyboardEvent;
    };
    target.addEventListener("keydown", listener);
    await dispatch.keyDown(target, { modifierHyper: true });
    expect({
      ambientInstance: event instanceof KeyboardEvent,
      iframeInstance: event instanceof iframeWindow.KeyboardEvent,
      hyper: event?.getModifierState("Hyper"),
    }).toEqual({
      ambientInstance: false,
      iframeInstance: true,
      hyper: false,
    });
  },
);

// The pointer members reach a cross-realm event through the type fallback
// `isPointerEvent` already applies, so this pins that the realm-resolved
// interface test doesn't take them away again.
test.each([
  ["pointerDown", "pointerdown"],
  ["click", "click"],
] as const)(
  "dispatch.%s initializes an event dispatched inside an iframe",
  async (dispatcher, type) => {
    using fixture = createIframeButton();
    const { button, iframeWindow } = fixture;
    let event: PointerEvent | undefined;
    button.addEventListener(type, (receivedEvent) => {
      event = receivedEvent;
    });
    await dispatch[dispatcher](button, { pointerType: "pen", tiltX: 30 });
    expect({
      ambientInstance: event instanceof PointerEvent,
      iframeInstance: event instanceof iframeWindow.PointerEvent,
      altitudeAngle: event?.altitudeAngle,
      azimuthAngle: event?.azimuthAngle,
      width: event?.width,
      height: event?.height,
      pointerType: event?.pointerType,
      tiltX: event?.tiltX,
      detail: event?.detail,
    }).toEqual({
      ambientInstance: false,
      iframeInstance: true,
      altitudeAngle: Math.PI / 2,
      azimuthAngle: 0,
      width: 1,
      height: 1,
      pointerType: "pen",
      tiltX: 30,
      detail: 0,
    });
  },
);

// jsdom reaches the same gap for a different reason: it ships no `DragEvent`,
// so `createEvent` falls back to `Event`. Its `WheelEvent` already derives from
// `MouseEvent`, and is pinned here so fixing drag can't stop initializing it.
// https://github.com/ariakit/ariakit/issues/7169
test.each([
  ["wheel", "wheel"],
  ["dragStart", "dragstart"],
] as const)(
  "dispatch.%s applies the MouseEventInit and modifier init members",
  async (dispatcher, type) => {
    const button = document.createElement("button");
    document.body.append(button);
    let event: MouseEvent | undefined;
    button.addEventListener(type, (receivedEvent) => {
      event = receivedEvent;
    });
    try {
      await dispatch[dispatcher](button, {
        ctrlKey: true,
        modifierCapsLock: true,
        clientX: 3,
        clientY: 4,
        movementX: 5,
        movementY: 6,
        button: 1,
      });
      expect({
        control: event?.getModifierState("Control"),
        capsLock: event?.getModifierState("CapsLock"),
        shift: event?.getModifierState("Shift"),
        ctrlKey: event?.ctrlKey,
        clientX: event?.clientX,
        clientY: event?.clientY,
        movementX: event?.movementX,
        movementY: event?.movementY,
        button: event?.button,
        buttons: event?.buttons,
        screenX: event?.screenX,
        screenY: event?.screenY,
        relatedTarget: event?.relatedTarget,
        detail: event?.detail,
      }).toEqual({
        control: true,
        capsLock: true,
        shift: false,
        ctrlKey: true,
        clientX: 3,
        clientY: 4,
        movementX: 5,
        movementY: 6,
        button: 1,
        buttons: 0,
        screenX: 0,
        screenY: 0,
        relatedTarget: null,
        detail: 0,
      });
    } finally {
      button.remove();
    }
  },
);
