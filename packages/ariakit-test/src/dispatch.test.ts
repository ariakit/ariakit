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
