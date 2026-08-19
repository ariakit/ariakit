import { afterAll, expect, test } from "vitest";

// Both environments this repository runs on implement `PointerEvent`, so the
// only way to reach the path an older jsdom takes is to remove the constructor
// before the package loads. The import is deferred past the deletion, and goes
// through the entry point rather than the module, because the entry point
// applies the shims: a fallback reintroduced there would reinstall the global
// and fail the precondition below.
// https://github.com/ariakit/ariakit/issues/7178
const nativePointerEvent = window.PointerEvent;
Reflect.deleteProperty(window, "PointerEvent");

const { dispatch, press } = await import("./index.ts");

afterAll(() => {
  window.PointerEvent = nativePointerEvent;
});

test("runs in an environment with no PointerEvent constructor", () => {
  // `initEvent` reads the ambient binding, so pin that rather than the window
  // property: they coincide only while the environment makes them the same
  // object, and the mouse assertions below would pass either way.
  expect(typeof PointerEvent).toBe("undefined");
});

test("keeps the click family on the closest interface available", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  const received: PointerEvent[] = [];
  button.addEventListener("click", (event) => {
    received.push(event);
  });
  try {
    // The dispatchers build `click`, `auxclick`, and `contextmenu` as
    // `PointerEvent`, the way browsers do, so these are the events an absent
    // constructor would otherwise strip down to a bare `Event`. Reaching a
    // listener at all is also what proves it no longer throws.
    await dispatch.click(button, {
      clientX: 11,
      button: 0,
      shiftKey: true,
      pointerType: "mouse",
    });
    const event = received[0];
    // Named with the closest interface the environment has, so this one keeps
    // the members `MouseEvent` computes as well.
    expect(event).toBeInstanceOf(MouseEvent);
    expect(event?.clientX).toBe(11);
    expect(event?.button).toBe(0);
    expect(event?.getModifierState("Shift")).toBe(true);
    expect(event?.pointerType).toBe("mouse");
    // The positive side of the boundary the `pointer*` test pins below, where
    // a bare `Event` carries no `pageX` at all.
    expect(event?.pageX).toBeDefined();
  } finally {
    button.remove();
  }
});

test("submits a form implicitly, which builds its click by hand", async () => {
  const form = document.createElement("form");
  form.innerHTML = "<input><button type='submit'>Save</button>";
  document.body.append(form);
  const input = form.querySelector("input");
  const submitted: Event[] = [];
  const clicks: PointerEvent[] = [];
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitted.push(event);
  });
  form.addEventListener("click", (event) => {
    clicks.push(event);
  });
  try {
    // `press` constructs this click itself rather than going through the
    // dispatchers, so it resolves the constructor separately.
    await press.Enter(input);
    expect(submitted).toHaveLength(1);
    const click = clicks[0];
    // Resolved to the closest interface available, and initialized with the
    // members a keyboard activation reports for the pointer that didn't cause
    // it, the same ones it reports where `PointerEvent` exists.
    expect(click).toBeInstanceOf(MouseEvent);
    expect(click?.pointerId).toBe(-1);
    expect(click?.pointerType).toBe("");
  } finally {
    form.remove();
  }
});

test("initializes pointer events built without the constructor", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  const received: PointerEvent[] = [];
  button.addEventListener("pointerdown", (event) => {
    received.push(event);
  });
  try {
    await dispatch.pointerDown(button, {
      clientX: 11,
      button: 0,
      shiftKey: true,
      pointerId: 7,
      pointerType: "pen",
    });
    const event = received[0];
    // `createEvent` fell back to `window.Event`, so the class is not
    // `MouseEvent` here, but every member the init dictionaries define is
    // assigned by name, the way drag and wheel events already are.
    expect(event).not.toBeInstanceOf(MouseEvent);
    expect(event?.clientX).toBe(11);
    expect(event?.button).toBe(0);
    expect(event?.getModifierState("Shift")).toBe(true);
    expect(event?.pointerId).toBe(7);
    expect(event?.pointerType).toBe("pen");
    // The boundary the readme documents: a member a browser computes rather
    // than reading from an init came from the `MouseEvent` base, which a bare
    // `Event` has no equivalent of, so no initializer can supply it.
    expect(event?.pageX).toBeUndefined();
  } finally {
    button.remove();
  }
});
