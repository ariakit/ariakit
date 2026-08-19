import { afterEach, expect, test } from "vitest";
import { q, select } from "./index.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

// Dragging across text ends the gesture with a `click`, so it reports the same
// pointer as the press and resets the contact, like the other helpers.
// https://github.com/ariakit/ariakit/issues/7162
test("select carries only the pointer identity to the click event", async () => {
  document.body.innerHTML = `<div>first second third</div>`;

  const element = q.text("first second third");
  const events: string[] = [];
  element.addEventListener("click", (event) => {
    const isPointerEvent = event instanceof PointerEvent;
    events.push(
      `${event.type} ${isPointerEvent} ${event.pointerId} ${event.pointerType} ${event.pressure}`,
    );
  });

  await select("second", element, {
    pointerId: 7,
    pointerType: "pen",
    pressure: 0.5,
  });

  expect(document.getSelection()?.toString()).toBe("second");
  expect(events).toEqual(["click true 7 pen 0"]);
});
