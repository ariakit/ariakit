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

// `auxclick` has no `@testing-library/dom` event map entry, so it can only be
// dispatched through the direct form, which is how the gap below surfaced.
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

// Parity covers the standard modifiers and `x`/`y`. happy-dom's `MouseEvent`
// constructor discards the `modifier*` init members, so a caller-built event
// cannot report those the way a named dispatcher does.
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

// Keyboard parity covers the `modifier*` init members too, because the
// environment records them for a caller-built event.
// https://github.com/ariakit/ariakit/issues/7166
test("dispatch(element, event) reports the same modifiers as the named form for a keyboard event", async () => {
  const input = document.createElement("input");
  document.body.append(input);
  const options: KeyboardEventInit = {
    key: "a",
    altKey: true,
    modifierCapsLock: true,
    // No browser engine implements `Super`, so neither path records it here.
    // Recording it on one side only would break the parity below.
    modifierSuper: true,
  };
  const received: KeyboardEvent[] = [];
  input.addEventListener("keydown", (event) => {
    received.push(event);
  });
  try {
    await dispatch(input, new KeyboardEvent("keydown", options));
    await dispatch.keyDown(input, options);
    const readModifiers = (event: KeyboardEvent | undefined) => ({
      alt: event?.getModifierState("Alt"),
      altGraph: event?.getModifierState("AltGraph"),
      capsLock: event?.getModifierState("CapsLock"),
      shift: event?.getModifierState("Shift"),
      super: event?.getModifierState("Super"),
    });
    const [direct, named] = received;
    expect(readModifiers(direct)).toEqual(readModifiers(named));
    expect(readModifiers(direct)).toEqual({
      alt: true,
      altGraph: false,
      capsLock: true,
      shift: false,
      super: false,
    });
  } finally {
    input.remove();
  }
});

function readPointerMembers(event: PointerEvent) {
  const { width, height, pressure, isPrimary } = event;
  return `${width} ${height} ${pressure} ${isPrimary}`;
}

// Pointer Events defaults `width` and `height` to 1, and requires 1 from any
// device with no contact geometry to report, like a mouse. The pressure and the
// primary pointer stay at their dictionary defaults, because a lone event carries
// no gesture to derive them from.
// https://w3c.github.io/pointerevents/#dom-pointerevent-width
test("dispatch.pointerDown reports the PointerEventInit defaults for the contact, pressure, and primary pointer", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let members: string | undefined;
  button.addEventListener("pointerdown", (event) => {
    members = readPointerMembers(event);
  });
  try {
    await dispatch.pointerDown(button);
    expect(members).toBe("1 1 0 false");
  } finally {
    button.remove();
  }
});

test("dispatch.pointerDown preserves provided pointer values", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let members: string | undefined;
  button.addEventListener("pointerdown", (event) => {
    members = readPointerMembers(event);
  });
  try {
    await dispatch.pointerDown(button, {
      width: 12,
      height: 14,
      pressure: 0.75,
      isPrimary: true,
    });
    expect(members).toBe("12 14 0.75 true");
  } finally {
    button.remove();
  }
});

// Zero is a contact size a digitizer can report, so it has to survive instead of
// falling back to the default.
test("dispatch.pointerDown preserves a zero contact size", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let members: string | undefined;
  button.addEventListener("pointerdown", (event) => {
    members = readPointerMembers(event);
  });
  try {
    await dispatch.pointerDown(button, { width: 0, height: 0 });
    expect(members).toBe("0 0 0 false");
  } finally {
    button.remove();
  }
});

function readTransducerAngles(event: PointerEvent) {
  return `${event.altitudeAngle} ${event.azimuthAngle}`;
}

// `initPointerEvent` used to leave these two alone, so they reached the event
// only through the constructor and took happy-dom's default of 0. Chromium,
// Firefox, and WebKit all report π/2 and 0 for a mouse, on every pointer event
// including `click`.
// https://github.com/ariakit/ariakit/issues/7172
test("dispatch.pointerDown reports the transducer angles of a perpendicular pointer", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let angles: string | undefined;
  button.addEventListener("pointerdown", (event) => {
    angles = readTransducerAngles(event);
  });
  try {
    await dispatch.pointerDown(button);
    expect(angles).toBe(`${Math.PI / 2} 0`);
  } finally {
    button.remove();
  }
});

test("dispatch.pointerDown preserves provided transducer angles", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let angles: string | undefined;
  button.addEventListener("pointerdown", (event) => {
    angles = readTransducerAngles(event);
  });
  try {
    await dispatch.pointerDown(button, { altitudeAngle: 0, azimuthAngle: 1 });
    expect(angles).toBe("0 1");
  } finally {
    button.remove();
  }
});
