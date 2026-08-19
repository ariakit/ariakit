// Covers the pointer members a gesture reports: the contact size and transducer
// angle `dispatch.ts` defaults, and the pressure and primary pointer `__mouse.ts`
// derives per phase. Both are exercised through the public helpers that fire the
// events.
import { afterEach, expect, test } from "vitest";
import { click, hover, mouseDown, mouseUp, q } from "./index.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

// Records each pointer event as `type width height pressure isPrimary`, the
// shape the expectations below were recorded in from Chromium 151, Firefox 153,
// and WebKit 26.5 through Playwright.
// https://github.com/ariakit/ariakit/issues/7172
function recordPointerEvents(element: Element, types: string[]) {
  const events: string[] = [];
  for (const type of types) {
    element.addEventListener(type, (event) => {
      const { width, height, pressure, isPrimary } = event as PointerEvent;
      events.push(`${event.type} ${width} ${height} ${pressure} ${isPrimary}`);
    });
  }
  return events;
}

const enterEventTypes = ["pointerover", "pointerenter", "pointermove"];

test("hover reports the contact and pointer a mouse reports", async () => {
  document.body.innerHTML = `<button type="button">Save</button>`;

  const button = q.button.ensure("Save");
  const events = recordPointerEvents(button, enterEventTypes);

  await hover(button);

  expect(events).toEqual([
    "pointerover 1 1 0 true",
    "pointerenter 1 1 0 true",
    "pointermove 1 1 0 true",
  ]);
});

test("hover reports the same values on the events leaving an element", async () => {
  document.body.innerHTML = `
    <button type="button">Save</button>
    <button type="button">Cancel</button>
  `;

  const save = q.button.ensure("Save");
  const events = recordPointerEvents(save, [
    "pointermove",
    "pointerout",
    "pointerleave",
  ]);

  await hover(save);
  await hover(q.button("Cancel"));

  expect(events).toEqual([
    "pointermove 1 1 0 true",
    "pointermove 1 1 0 true",
    "pointerout 1 1 0 true",
    "pointerleave 1 1 0 true",
  ]);
});

// A caller passing `buttons` describes a pointer moving with a button held, like
// a drag, which is in the active buttons state.
test("hover reports pressure while a button stays held", async () => {
  document.body.innerHTML = `<button type="button">Resize</button>`;

  const button = q.button.ensure("Resize");
  const events = recordPointerEvents(button, ["pointermove"]);

  await hover(button, { buttons: 1 });

  expect(events).toEqual(["pointermove 1 1 0.5 true"]);
});

test("mouseDown and mouseUp report the pressure of the button they press", async () => {
  document.body.innerHTML = `<button type="button">Resize</button>`;

  const button = q.button.ensure("Resize");
  const events = recordPointerEvents(button, ["pointerdown", "pointerup"]);

  await mouseDown(button);
  await mouseUp(button);

  expect(events).toEqual(["pointerdown 1 1 0.5 true", "pointerup 1 1 0 true"]);
});

// A chorded release ends one button while the pointer stays in the active
// buttons state, so the pressure holds. Firefox and WebKit report it that way;
// Chromium derives it from the button being released and reports 0.
test("a chorded release keeps the pressure of the button still held", async () => {
  document.body.innerHTML = `<button type="button">Resize</button>`;

  const button = q.button.ensure("Resize");
  const events = recordPointerEvents(button, [
    "pointerdown",
    "pointermove",
    "pointerup",
  ]);

  // The primary button stays held while the secondary one is pressed and
  // released.
  await mouseDown(button);
  await mouseDown(button, { button: 2, buttons: 3 });
  await mouseUp(button, { button: 2, buttons: 1 });
  await mouseUp(button);

  expect(events).toEqual([
    "pointerdown 1 1 0.5 true",
    "pointermove 1 1 0.5 true",
    "pointermove 1 1 0.5 true",
    "pointerup 1 1 0 true",
  ]);
});

// This is the pointer sequence all three engines produce for one ordinary click.
test("click reports the values a browser reports through the gesture", async () => {
  document.body.innerHTML = `<button type="button">Submit</button>`;

  const button = q.button.ensure("Submit");
  const events = recordPointerEvents(button, [
    ...enterEventTypes,
    "pointerdown",
    "pointerup",
  ]);

  await click(button);

  expect(events).toEqual([
    "pointerover 1 1 0 true",
    "pointerenter 1 1 0 true",
    "pointermove 1 1 0 true",
    "pointerdown 1 1 0.5 true",
    "pointerup 1 1 0 true",
  ]);
});

// The transducer angle reaches a gesture from the dispatch layer, so one press
// covers it for every helper. Every engine reports a perpendicular transducer for
// a mouse.
test("a press reports the transducer angle of a perpendicular pointer", async () => {
  document.body.innerHTML = `<button type="button">Resize</button>`;

  const button = q.button.ensure("Resize");
  let angles: string | undefined;
  button.addEventListener("pointerdown", (event) => {
    angles = `${event.altitudeAngle} ${event.azimuthAngle}`;
  });

  await mouseDown(button);

  expect(angles).toBe(`${Math.PI / 2} 0`);
});

test("explicit pointer values win over the simulated ones", async () => {
  document.body.innerHTML = `<button type="button">Draw</button>`;

  const button = q.button.ensure("Draw");
  const events = recordPointerEvents(button, [
    "pointermove",
    "pointerdown",
    "pointerup",
  ]);

  // A second pen touching a digitizer that reports its own contact geometry.
  const options: PointerEventInit = {
    pointerType: "pen",
    width: 12,
    height: 14,
    pressure: 0.75,
    isPrimary: false,
  };

  await hover(button, options);
  await mouseDown(button, options);
  await mouseUp(button, options);

  expect(events).toEqual([
    "pointermove 12 14 0.75 false",
    "pointerdown 12 14 0.75 false",
    "pointerup 12 14 0.75 false",
  ]);
});

// Zero is a value a pressure-sensitive device reports, so it has to win over the
// 0.5 the press would otherwise derive.
test("an explicit zero pressure wins over the pressure a press derives", async () => {
  document.body.innerHTML = `<button type="button">Draw</button>`;

  const button = q.button.ensure("Draw");
  const events = recordPointerEvents(button, ["pointerdown"]);

  await mouseDown(button, { pressure: 0 });

  expect(events).toEqual(["pointerdown 1 1 0 true"]);
});
