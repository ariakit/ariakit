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

// UI Events specifies one modifier name per `EventModifierInit` member, and an
// unrecognized name reports false. `modifierHyper` and `modifierSuper` are left
// out, since no engine reports either; the keyboard parity test below covers
// them instead.
// https://w3c.github.io/uievents/#event-modifier-initializers
// https://github.com/ariakit/ariakit/issues/7168
const modifierNameByInitMember = {
  altKey: "Alt",
  ctrlKey: "Control",
  metaKey: "Meta",
  shiftKey: "Shift",
  modifierAltGraph: "AltGraph",
  modifierCapsLock: "CapsLock",
  modifierFn: "Fn",
  modifierFnLock: "FnLock",
  modifierNumLock: "NumLock",
  modifierScrollLock: "ScrollLock",
  modifierSymbol: "Symbol",
  modifierSymbolLock: "SymbolLock",
} as const satisfies Record<string, string>;

const modifierInitMembers = Object.keys(modifierNameByInitMember) as Array<
  keyof typeof modifierNameByInitMember
>;

const modifierNames = Object.values(modifierNameByInitMember);

test("dispatch.keyDown maps each modifier init member to its own modifier name", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let event: KeyboardEvent | undefined;
  button.addEventListener("keydown", (keyDownEvent) => {
    event = keyDownEvent;
  });
  try {
    // One dispatch per member, so a member that reports another member's name
    // fails even though requesting them together would not tell the two apart.
    const pressed: Record<string, string[]> = {};
    for (const member of modifierInitMembers) {
      const options: EventModifierInit = {};
      options[member] = true;
      await dispatch.keyDown(button, options);
      pressed[member] = modifierNames.filter((name) =>
        event?.getModifierState(name),
      );
    }
    expect(pressed).toEqual(
      Object.fromEntries(
        modifierInitMembers.map((member) => [
          member,
          [modifierNameByInitMember[member]],
        ]),
      ),
    );
  } finally {
    button.remove();
  }
});

test("dispatch.click reports false for modifier names it doesn't recognize", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let event: MouseEvent | undefined;
  button.addEventListener("click", (clickEvent) => {
    event = clickEvent;
  });
  try {
    await dispatch.click(button);
    // `Object.prototype` member names are the interesting case: an object
    // literal answers them with an inherited value instead of `undefined`.
    const keys = ["constructor", "toString", "hasOwnProperty", "Nope"];
    expect(keys.map((key) => event?.getModifierState(key))).toEqual([
      false,
      false,
      false,
      false,
    ]);
  } finally {
    button.remove();
  }
});

// These carry the mouse and modifier members in browsers, where `WheelEvent`
// and `DragEvent` derive from `MouseEvent`, but not in the test environments.
// Every dispatcher the two interfaces cover is listed, because the set they are
// selected by mirrors `@testing-library/dom`'s event map by hand. `dragExit` is
// the exception: browsers never fire it, so it has no typed listener to assert
// through.
// https://github.com/ariakit/ariakit/issues/7169
test.each([
  ["wheel", "wheel"],
  ["drag", "drag"],
  ["dragEnd", "dragend"],
  ["dragEnter", "dragenter"],
  ["dragLeave", "dragleave"],
  ["dragOver", "dragover"],
  ["dragStart", "dragstart"],
  ["drop", "drop"],
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
        shiftKey: event?.shiftKey,
        clientX: event?.clientX,
        clientY: event?.clientY,
        x: event?.x,
        y: event?.y,
        movementX: event?.movementX,
        movementY: event?.movementY,
        button: event?.button,
        buttons: event?.buttons,
        // Omitted members report the value the browser defaults them to, which
        // covers the whole `MouseEventInit` surface between them and the ones
        // requested above.
        screenX: event?.screenX,
        screenY: event?.screenY,
        relatedTarget: event?.relatedTarget,
        // `UIEvent` members, which the browser interfaces inherit through
        // `MouseEvent`.
        detail: event?.detail,
      }).toEqual({
        control: true,
        capsLock: true,
        shift: false,
        ctrlKey: true,
        shiftKey: false,
        clientX: 3,
        clientY: 4,
        x: 3,
        y: 4,
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

test("dispatch.wheel keeps the members only WheelEvent defines", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let event: WheelEvent | undefined;
  button.addEventListener("wheel", (wheelEvent) => {
    event = wheelEvent;
  });
  try {
    await dispatch.wheel(button, { deltaX: 10, deltaY: -100, deltaMode: 1 });
    expect([event?.deltaX, event?.deltaY, event?.deltaMode]).toEqual([
      10, -100, 1,
    ]);
  } finally {
    button.remove();
  }
});

// `createEvent` installs `dataTransfer` itself, with a non-configurable
// descriptor, before the mouse members are initialized. An initializer that
// reached this member would throw rather than silently lose it.
test("dispatch.drop keeps the member only DragEvent defines", async () => {
  const zone = document.createElement("div");
  document.body.append(zone);
  let event: DragEvent | undefined;
  zone.addEventListener("drop", (dropEvent) => {
    event = dropEvent;
  });
  try {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", "Ariakit");
    await dispatch.drop(zone, { dataTransfer, clientX: 3 });
    expect(event?.dataTransfer?.getData("text/plain")).toBe("Ariakit");
    expect(event?.clientX).toBe(3);
  } finally {
    zone.remove();
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
    // `Hyper` and `Super` are the two members no engine reports even when the
    // event is built with them, so neither path records them and both report
    // false below. Recording them on one side only would break the parity.
    modifierHyper: true,
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
      hyper: event?.getModifierState("Hyper"),
      super: event?.getModifierState("Super"),
    });
    const [direct, named] = received;
    expect(readModifiers(direct)).toEqual(readModifiers(named));
    expect(readModifiers(direct)).toEqual({
      alt: true,
      altGraph: false,
      capsLock: true,
      shift: false,
      hyper: false,
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
