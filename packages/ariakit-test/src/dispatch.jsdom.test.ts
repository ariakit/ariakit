// @vitest-environment jsdom

import { expect, test } from "vitest";
import { dispatch } from "./index.ts";

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
