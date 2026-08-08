import { expect, test } from "vitest";
import { hover } from "./hover.ts";

test("moves directly from the previous target to the next target", async () => {
  const first = document.createElement("div");
  first.id = "first";
  const second = document.createElement("div");
  second.id = "second";
  for (const element of [first, second]) {
    element.style.width = "10px";
    element.style.height = "10px";
  }
  document.body.append(first, second);

  const events: string[] = [];
  const eventTypes = [
    "pointerout",
    "pointerleave",
    "mouseout",
    "mouseleave",
    "pointerover",
    "pointerenter",
    "mouseover",
    "mouseenter",
    "pointermove",
    "mousemove",
  ];
  for (const element of [first, second]) {
    for (const eventType of eventTypes) {
      element.addEventListener(eventType, (event) => {
        events.push(`${event.type}:${element.id}`);
      });
    }
  }

  // movementX isn't representable through the browser provider, so Browser
  // Mode exercises the same synthetic fallback as the DOM project.
  await hover(first, { movementX: 0 });
  events.length = 0;
  await hover(second, { movementX: 0 });

  expect(events).toEqual([
    "pointerout:first",
    "pointerleave:first",
    "mouseout:first",
    "mouseleave:first",
    "pointerover:second",
    "pointerenter:second",
    "mouseover:second",
    "mouseenter:second",
    "pointermove:second",
    "mousemove:second",
  ]);
});
