import { afterEach, expect, test } from "vitest";
import { click, q, rightClick } from "./index.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

// Records each event as `type button buttons detail`, the same shape the
// expectations below were recorded in from Chromium, Firefox, and WebKit
// through Playwright. `focus` reports `-` for the two mouse-only properties.
function recordEvents(element: Element) {
  const events: string[] = [];
  const types = [
    "pointerdown",
    "mousedown",
    "focus",
    "contextmenu",
    "pointerup",
    "mouseup",
    "click",
    "auxclick",
  ];
  for (const type of types) {
    element.addEventListener(type, (event) => {
      const isMouseEvent = event instanceof MouseEvent;
      const button = isMouseEvent ? event.button : "-";
      const buttons = isMouseEvent ? event.buttons : "-";
      const detail = event instanceof UIEvent ? event.detail : 0;
      events.push(`${event.type} ${button} ${buttons} ${detail}`);
    });
  }
  return events;
}

test("shift-click exposes updated selectedOptions on change", async () => {
  document.body.innerHTML = `
    <label for="fruits">Fruits</label>
    <select id="fruits" multiple size="4">
      <option>Apple</option>
      <option selected>Banana</option>
      <option>Cherry</option>
      <option>Date</option>
    </select>
  `;

  const select = q.listbox.ensure("Fruits") as HTMLSelectElement;
  const date = q.option("Date");
  let changedSelection: string[] = [];
  let mouseUpSelection: string[] = [];
  select.addEventListener("mouseup", (event) => {
    const target = event.currentTarget as HTMLSelectElement;
    mouseUpSelection = Array.from(
      target.selectedOptions,
      (option) => option.value,
    );
  });
  select.addEventListener("change", (event) => {
    const target = event.target as HTMLSelectElement;
    changedSelection = Array.from(
      target.selectedOptions,
      (option) => option.value,
    );
  });

  expect(Array.from(select.selectedOptions, (option) => option.value)).toEqual([
    "Banana",
  ]);

  await click(date, { shiftKey: true });

  expect(mouseUpSelection).toEqual(["Banana"]);
  expect(changedSelection).toEqual(["Banana", "Cherry", "Date"]);
});

test("click with the auxiliary button dispatches auxclick instead of click", async () => {
  document.body.innerHTML = `<button type="button">Paste</button>`;

  const button = q.button.ensure("Paste");
  const events = recordEvents(button);

  await click(button, { button: 1 });

  expect(events).toEqual([
    "pointerdown 1 4 0",
    "mousedown 1 4 1",
    "focus - - 0",
    "pointerup 1 0 0",
    "mouseup 1 0 1",
    "auxclick 1 0 1",
  ]);
});

// The pointer moves onto the element before anything is pressed, so the hover
// phase reports no button held even when the caller passes one.
test("click moves the pointer onto the element with no button held", async () => {
  document.body.innerHTML = `<button type="button">Paste</button>`;

  const button = q.button.ensure("Paste");
  const events: string[] = [];

  const types = [
    "pointerover",
    "pointerenter",
    "mouseover",
    "mouseenter",
    "pointermove",
    "mousemove",
  ];

  for (const type of types) {
    button.addEventListener(type, (event) => {
      const { button: moved, buttons } = event as MouseEvent;
      events.push(`${event.type} ${moved} ${buttons}`);
    });
  }

  await click(button, { button: 1, buttons: 1 });

  expect(events).toEqual([
    "pointerover 0 0",
    "pointerenter 0 0",
    "mouseover 0 0",
    "mouseenter 0 0",
    "pointermove 0 0",
    "mousemove 0 0",
  ]);
});

// An explicit `buttons` changes nothing here, so both sequences match the ones
// the tests that pass no `buttons` assert.
test("click and rightClick derive buttons from the button they press", async () => {
  document.body.innerHTML = `
    <button type="button">Paste</button>
    <button type="button">Open menu</button>
  `;

  const paste = q.button.ensure("Paste");
  const menu = q.button.ensure("Open menu");
  const pasteEvents = recordEvents(paste);
  const menuEvents = recordEvents(menu);

  await click(paste, { button: 1, buttons: 1 });
  await rightClick(menu, { buttons: 1 });

  expect(pasteEvents).toEqual([
    "pointerdown 1 4 0",
    "mousedown 1 4 1",
    "focus - - 0",
    "pointerup 1 0 0",
    "mouseup 1 0 1",
    "auxclick 1 0 1",
  ]);
  expect(menuEvents).toEqual([
    "pointerdown 2 2 0",
    "mousedown 2 2 1",
    "focus - - 0",
    "contextmenu 2 2 0",
    "pointerup 2 0 0",
    "mouseup 2 0 1",
    "auxclick 2 0 1",
  ]);
});

test("click with the primary button keeps dispatching click", async () => {
  document.body.innerHTML = `<button type="button">Submit</button>`;

  const button = q.button.ensure("Submit");
  const events = recordEvents(button);

  await click(button);

  expect(events).toEqual([
    "pointerdown 0 1 0",
    "mousedown 0 1 1",
    "focus - - 0",
    "pointerup 0 0 0",
    "mouseup 0 0 1",
    "click 0 0 1",
  ]);
});

test("click with the secondary button matches rightClick", async () => {
  document.body.innerHTML = `<button type="button">Open menu</button>`;

  const button = q.button.ensure("Open menu");
  const events = recordEvents(button);

  await click(button, { button: 2 });

  expect(events).toEqual([
    "pointerdown 2 2 0",
    "mousedown 2 2 1",
    "focus - - 0",
    "contextmenu 2 2 0",
    "pointerup 2 0 0",
    "mouseup 2 0 1",
    "auxclick 2 0 1",
  ]);
});

// Unlike `click`, browsers keep firing `auxclick` on a disabled control. Chromium
// and WebKit fire it; Firefox is the exception and fires neither `auxclick` nor
// the compatibility mouse events.
test("click with the auxiliary button dispatches auxclick on disabled controls", async () => {
  document.body.innerHTML = `<button type="button" disabled>Paste</button>`;

  const button = q.button.ensure("Paste");
  const events = recordEvents(button);

  await click(button, { button: 1 });

  expect(events).toEqual([
    "pointerdown 1 4 0",
    "pointerup 1 0 0",
    "auxclick 1 0 1",
  ]);
});

// Label and `option` activation runs on `click`, so an auxiliary click leaves
// both alone. WebKit forwards a middle click on a label to its control, but
// Chromium and Firefox match the specification and don't.
test("click with the auxiliary button doesn't run activation behavior", async () => {
  document.body.innerHTML = `
    <label for="agree">Agree</label>
    <input id="agree" type="checkbox">
    <label for="fruits">Fruits</label>
    <select id="fruits" multiple size="3">
      <option>Apple</option>
      <option selected>Banana</option>
      <option>Cherry</option>
    </select>
  `;

  const select = q.listbox.ensure("Fruits") as HTMLSelectElement;
  const checkbox = q.checkbox.ensure("Agree") as HTMLInputElement;
  const label = q.text.ensure("Agree");
  const cherry = q.option.ensure("Cherry");
  const checkboxEvents = recordEvents(checkbox);
  const labelEvents = recordEvents(label);
  const optionEvents = recordEvents(cherry);

  await click(label, { button: 1 });
  await click(cherry, { button: 1 });

  // The aux click still reaches both targets; it just doesn't activate them.
  expect(labelEvents).toContain("auxclick 1 0 1");
  expect(optionEvents).toContain("auxclick 1 0 1");
  expect(
    [...labelEvents, ...optionEvents].filter((event) =>
      event.startsWith("click "),
    ),
  ).toEqual([]);

  expect(checkbox.checked).toBe(false);
  expect(checkboxEvents).toEqual([]);
  expect(Array.from(select.selectedOptions, (option) => option.value)).toEqual([
    "Banana",
  ]);
});

// Records the pointer members that separate the press from the event ending the
// gesture, in the shape the expectations below were recorded in from Chromium,
// Firefox, and WebKit through Playwright.
// https://github.com/ariakit/ariakit/issues/7162
function recordPointerMembers(element: Element, types: string[]) {
  const events: string[] = [];
  for (const type of types) {
    element.addEventListener(type, (event) => {
      const { pointerId, pointerType, isPrimary, pressure, tiltX } =
        event as PointerEvent;
      const isPointerEvent = event instanceof PointerEvent;
      events.push(
        `${event.type} ${isPointerEvent} ${pointerId} ${pointerType} ${isPrimary} ${pressure} ${tiltX}`,
      );
    });
  }
  return events;
}

// Browsers carry only the causal pointer's identity onto the event that ends
// the gesture: a pen press reporting `tiltX: 30` still produces a `click` with
// `tiltX: 0`. `isPrimary` describes the pointer, so it carries over, the way
// Firefox and WebKit report it (Chromium resets it).
test("click carries only the pointer identity to the click event", async () => {
  document.body.innerHTML = `<button type="button">Submit</button>`;

  const button = q.button.ensure("Submit");
  const events = recordPointerMembers(button, ["pointerdown", "click"]);

  await click(button, {
    pointerId: 7,
    pointerType: "pen",
    isPrimary: true,
    pressure: 0.5,
    tiltX: 30,
  });

  expect(events).toEqual([
    "pointerdown true 7 pen true 0.5 30",
    "click true 7 pen true 0 0",
  ]);
});

test("click with the auxiliary button carries the pointer identity to auxclick", async () => {
  document.body.innerHTML = `<button type="button">Paste</button>`;

  const button = q.button.ensure("Paste");
  const events = recordPointerMembers(button, ["pointerdown", "auxclick"]);

  await click(button, {
    button: 1,
    pointerId: 7,
    pointerType: "pen",
    isPrimary: true,
    pressure: 0.5,
    tiltX: 30,
  });

  expect(events).toEqual([
    "pointerdown true 7 pen true 0.5 30",
    "auxclick true 7 pen true 0 0",
  ]);
});

// Activating a label forwards a click to its control, and Chromium and Firefox
// give that forwarded event the pointer that caused it. WebKit reports an unset
// pointer there instead.
test("click forwards the pointer identity from a label to its control", async () => {
  document.body.innerHTML = `
    <label for="agree">Agree</label>
    <input id="agree" type="checkbox">
  `;

  const label = q.text.ensure("Agree");
  const checkbox = q.checkbox.ensure("Agree");
  const events = recordPointerMembers(checkbox, ["click"]);

  await click(label, {
    pointerId: 7,
    pointerType: "pen",
    isPrimary: true,
    pressure: 0.5,
    tiltX: 30,
  });

  expect(events).toEqual(["click true 7 pen true 0 0"]);
  expect((checkbox as HTMLInputElement).checked).toBe(true);
});

test("rightClick carries the pointer identity to contextmenu and auxclick", async () => {
  document.body.innerHTML = `<button type="button">Open menu</button>`;

  const button = q.button.ensure("Open menu");
  const events = recordPointerMembers(button, [
    "pointerdown",
    "contextmenu",
    "auxclick",
  ]);

  await rightClick(button, {
    pointerId: 7,
    pointerType: "pen",
    isPrimary: true,
    pressure: 0.5,
    tiltX: 30,
  });

  expect(events).toEqual([
    "pointerdown true 7 pen true 0.5 30",
    "contextmenu true 7 pen true 0 0",
    "auxclick true 7 pen true 0 0",
  ]);
});
