import { expect, test } from "vitest";
import { dispatch, press } from "./index.ts";

test("dispatch.keyDown uses empty strings for omitted keyboard strings", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let key: string | undefined;
  let code: string | undefined;
  button.addEventListener("keydown", (event) => {
    key = event.key;
    code = event.code;
  });
  try {
    await dispatch.keyDown(button);
    expect(key).toBe("");
    expect(code).toBe("");
  } finally {
    button.remove();
  }
});

test("dispatch.keyDown preserves provided keyboard strings", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let key: string | undefined;
  let code: string | undefined;
  button.addEventListener("keydown", (event) => {
    key = event.key;
    code = event.code;
  });
  try {
    await dispatch.keyDown(button, { key: "m", code: "KeyM" });
    expect(key).toBe("m");
    expect(code).toBe("KeyM");
  } finally {
    button.remove();
  }
});

test("press uses an empty string for omitted keyboard code", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let key: string | undefined;
  let code: string | undefined;
  button.addEventListener("keydown", (event) => {
    key = event.key;
    code = event.code;
  });
  try {
    await press("m", button);
    expect(key).toBe("m");
    expect(code).toBe("");
  } finally {
    button.remove();
  }
});

test("press.ArrowUp uses an empty inputType when stepping a number input", async () => {
  const input = document.createElement("input");
  input.type = "number";
  input.value = "5";
  document.body.append(input);
  let inputType: string | undefined;
  input.addEventListener("input", (event) => {
    if (event instanceof InputEvent) {
      inputType = event.inputType;
    }
  });
  try {
    await press.ArrowUp(input);
    expect(input.value).toBe("6");
    expect(inputType).toBe("");
  } finally {
    input.remove();
  }
});

test("dispatch.input preserves provided inputType", async () => {
  const input = document.createElement("input");
  document.body.append(input);
  let inputType: string | undefined;
  input.addEventListener("input", (event) => {
    if (event instanceof InputEvent) {
      inputType = event.inputType;
    }
  });
  try {
    await dispatch.input(input, { inputType: "insertReplacementText" });
    expect(inputType).toBe("insertReplacementText");
  } finally {
    input.remove();
  }
});

// Pointer Events defines `click`, `auxclick`, and `contextmenu` as
// `PointerEvent`, which is what Chromium, Firefox, and WebKit dispatch for all
// three. `@testing-library/dom` declares `MouseEvent` for `click` and
// `contextMenu`, and has no `auxclick` entry at all.
// https://github.com/ariakit/ariakit/issues/7162
// https://www.w3.org/TR/pointerevents/#the-click-auxclick-and-contextmenu-events
test("dispatch builds the click-family events as PointerEvent", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  const events: string[] = [];
  for (const type of ["click", "auxclick", "contextmenu"]) {
    button.addEventListener(type, (event) => {
      const { pointerId, pointerType } = event as PointerEvent;
      const isPointerEvent = event instanceof PointerEvent;
      events.push(
        `${event.type} ${isPointerEvent} ${pointerId} ${pointerType}`,
      );
    });
  }
  const options: PointerEventInit = { pointerId: 7, pointerType: "pen" };
  try {
    await dispatch.click(button, options);
    await dispatch.auxClick(button, options);
    await dispatch.contextMenu(button, options);
    expect(events).toEqual([
      "click true 7 pen",
      "auxclick true 7 pen",
      "contextmenu true 7 pen",
    ]);
  } finally {
    button.remove();
  }
});

// `dispatch` fires the event the caller describes. Dropping the attributes a
// browser resets on a click is the job of the gesture helpers, which know the
// press those attributes came from.
test("dispatch.click keeps the contact attributes the caller passes", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let event: PointerEvent | undefined;
  button.addEventListener("click", (clickEvent) => {
    event = clickEvent;
  });
  try {
    await dispatch.click(button, { pressure: 0.5, tiltX: 30 });
    expect(event?.pressure).toBe(0.5);
    expect(event?.tiltX).toBe(30);
  } finally {
    button.remove();
  }
});

// The named dispatchers report a default mouse pointer when the caller names
// none, the same default every other pointer event uses.
test("dispatch.click defaults to a mouse pointer", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let event: PointerEvent | undefined;
  button.addEventListener("click", (clickEvent) => {
    event = clickEvent;
  });
  try {
    await dispatch.click(button);
    expect(event?.pointerId).toBe(0);
    expect(event?.pointerType).toBe("mouse");
  } finally {
    button.remove();
  }
});

test("dispatch.auxClick reports a prevented default", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  try {
    expect(await dispatch.auxClick(button)).toBe(true);
    button.addEventListener("auxclick", (event) => event.preventDefault());
    expect(await dispatch.auxClick(button)).toBe(false);
  } finally {
    button.remove();
  }
});

// `auxclick` has no `@testing-library/dom` event map entry, so the direct form
// was the only way to fire it before `dispatch.auxClick`, which is how the gap
// below surfaced. This keeps covering that caller-built form.
// https://github.com/ariakit/ariakit/issues/7156
test("dispatch(element, event) reads modifier state on a caller-built mouse event", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  const modifiers: boolean[] = [];
  button.addEventListener("auxclick", (event) => {
    // A plain DOM listener calls this unguarded, the way a browser allows.
    modifiers.push(
      event.getModifierState("Shift"),
      event.getModifierState("Control"),
    );
  });
  try {
    await dispatch(
      button,
      new MouseEvent("auxclick", { bubbles: true, shiftKey: true }),
    );
    expect(modifiers).toEqual([true, false]);
  } finally {
    button.remove();
  }
});

// Parity covers the standard modifiers and `x`/`y`. happy-dom's constructor
// discards the `modifier*` init members, so a caller-built event cannot report
// those the way a named dispatcher does.
test("dispatch(element, event) reports the same standard modifiers and x/y as the named form", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  const options: MouseEventInit = { shiftKey: true, clientX: 7, clientY: 9 };
  let direct: MouseEvent | undefined;
  let named: MouseEvent | undefined;
  button.addEventListener("auxclick", (event) => {
    direct = event;
  });
  button.addEventListener("click", (event) => {
    named = event;
  });
  try {
    await dispatch(button, new MouseEvent("auxclick", options));
    await dispatch.click(button, options);
    const readMembers = (event: MouseEvent | undefined) => ({
      shift: event?.getModifierState("Shift"),
      control: event?.getModifierState("Control"),
      x: event?.x,
      y: event?.y,
    });
    expect(readMembers(direct)).toEqual(readMembers(named));
    expect(readMembers(direct)).toEqual({
      shift: true,
      control: false,
      x: 7,
      y: 9,
    });
  } finally {
    button.remove();
  }
});
