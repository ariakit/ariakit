import { beforeEach, expect, test } from "vitest";
import { click } from "./click.ts";
import { mouseDown } from "./mouse-down.ts";
import { mouseUp } from "./mouse-up.ts";
import { q } from "./query.ts";
import { select } from "./select.ts";
import "./shims.ts";

const selectionText = "sample paragraph text";

const pressEventTypes = ["pointerdown", "mousedown", "pointerup", "mouseup"];

// A chorded button change rides on `pointermove`, which only the chord tests
// record because `hover` fires it too.
const chordEventTypes = [...pressEventTypes, "pointermove"];

// Records each press event as `type button buttons`.
function recordPressEvents(element: Element, types = pressEventTypes) {
  const events: string[] = [];
  for (const type of types) {
    element.addEventListener(type, (event) => {
      const { button, buttons } = event as MouseEvent;
      events.push(`${event.type} ${button} ${buttons}`);
    });
  }
  return events;
}

beforeEach(() => {
  document.body.innerHTML = `
    <p>Keep this ${selectionText} selected.</p>
    <button type="button">Preserve selection</button>
    <label>
      Editable target
      <input />
    </label>
    <label>
      Email target
      <input type="email" />
    </label>
    <label>
      Toggle target
      <input type="checkbox" />
    </label>
    <label>
      Select target
      <select>
        <option>One</option>
      </select>
    </label>
    <a href="#target">Link target</a>
    <svg>
      <a href="#svg-target">
        <text>SVG link target</text>
      </a>
    </svg>
    <div tabindex="0">Focusable text target</div>
    <p>Plain text target</p>
  `;
});

async function selectParagraphText() {
  await select(selectionText, q.text(/Keep this/));
  expect(document.getSelection()?.toString()).toBe(selectionText);
}

test("mouseDown on a button preserves the document selection", async () => {
  await selectParagraphText();
  await mouseDown(q.button("Preserve selection"));
  expect(document.getSelection()?.toString()).toBe(selectionText);
  expect(q.button("Preserve selection")).toHaveFocus();
});

test("mouseDown on an editable target clears the document selection", async () => {
  await selectParagraphText();
  await mouseDown(q.textbox("Editable target"));
  expect(document.getSelection()?.toString()).toBe("");
});

test("mouseDown on an email input clears the document selection", async () => {
  await selectParagraphText();
  await mouseDown(q.textbox("Email target"));
  expect(document.getSelection()?.toString()).toBe("");
});

test("mouseDown on a non-text input preserves the document selection", async () => {
  await selectParagraphText();
  await mouseDown(q.checkbox("Toggle target"));
  expect(document.getSelection()?.toString()).toBe(selectionText);
});

test("mouseDown on a select preserves the document selection", async () => {
  await selectParagraphText();
  await mouseDown(q.combobox("Select target"));
  expect(document.getSelection()?.toString()).toBe(selectionText);
});

test("mouseDown on a link preserves the document selection", async () => {
  await selectParagraphText();
  await mouseDown(q.link("Link target"));
  expect(document.getSelection()?.toString()).toBe(selectionText);
});

test("mouseDown on an SVG link preserves the document selection", async () => {
  await selectParagraphText();
  await mouseDown(q.link("SVG link target"));
  expect(document.getSelection()?.toString()).toBe(selectionText);
});

test("mouseDown on a focusable text target clears the document selection", async () => {
  await selectParagraphText();
  await mouseDown(q.text("Focusable text target"));
  expect(document.getSelection()?.toString()).toBe("");
});

test("mouseDown on a plain text target clears the document selection", async () => {
  await selectParagraphText();
  await mouseDown(q.text("Plain text target"));
  expect(document.getSelection()?.toString()).toBe("");
});

test("click suppresses mouse events when pointerdown is prevented", async () => {
  document.body.innerHTML = `
    <input aria-label="Before" />
    <button type="button">Press me</button>
  `;

  const input = q.textbox.ensure("Before");
  const button = q.button.ensure("Press me");
  const events: string[] = [];
  let preventPointerDown = true;

  input.focus();

  button.addEventListener("pointerdown", (event) => {
    events.push(event.type);
    if (preventPointerDown) {
      event.preventDefault();
    }
  });
  button.addEventListener("mousedown", (event) => events.push(event.type));
  button.addEventListener("focus", (event) => events.push(event.type));
  button.addEventListener("pointerup", (event) => events.push(event.type));
  button.addEventListener("mouseup", (event) => events.push(event.type));
  button.addEventListener("click", (event) => events.push(event.type));

  await click(button);

  expect(events).toEqual(["pointerdown", "pointerup", "click"]);
  expect(input).toHaveFocus();

  events.length = 0;
  preventPointerDown = false;

  await click(button);

  expect(events).toEqual([
    "pointerdown",
    "mousedown",
    "focus",
    "pointerup",
    "mouseup",
    "click",
  ]);
  expect(button).toHaveFocus();
});

test("mouseUp suppresses mouseup after a prevented pointerdown", async () => {
  document.body.innerHTML = `<button type="button">Press me</button>`;

  const button = q.button.ensure("Press me");
  const events: string[] = [];
  let preventPointerDown = true;

  button.addEventListener("pointerdown", (event) => {
    events.push(event.type);
    if (preventPointerDown) {
      event.preventDefault();
    }
  });
  button.addEventListener("mousedown", (event) => events.push(event.type));
  button.addEventListener("pointerup", (event) => events.push(event.type));
  button.addEventListener("mouseup", (event) => events.push(event.type));

  await mouseDown(button);
  await mouseUp(button);

  expect(events).toEqual(["pointerdown", "pointerup"]);

  events.length = 0;
  preventPointerDown = false;

  await mouseDown(button);
  await mouseUp(button);

  expect(events).toEqual(["pointerdown", "mousedown", "pointerup", "mouseup"]);
});

// A standalone press must report the held button in `buttons` the way a browser
// does, so a component that starts dragging on `buttons === 1` reacts to
// `mouseDown` on its own and not only to a full `click`. The `buttons` bits are
// not in `button` order, so every mapping is asserted.
test("mouseDown and mouseUp report the held button", async () => {
  document.body.innerHTML = `<button type="button">Resize</button>`;

  const button = q.button.ensure("Resize");
  const events = recordPressEvents(button);

  const heldButtons = [
    [0, 1],
    [1, 4],
    [2, 2],
    [3, 8],
    [4, 16],
    [5, 32],
  ];

  for (const [pressed, held] of heldButtons) {
    events.length = 0;

    await mouseDown(button, { button: pressed });
    await mouseUp(button, { button: pressed });

    expect(events).toEqual([
      `pointerdown ${pressed} ${held}`,
      `mousedown ${pressed} ${held}`,
      `pointerup ${pressed} 0`,
      `mouseup ${pressed} 0`,
    ]);
  }
});

// A chorded gesture holds buttons that can't be derived from the one being
// pressed, so an explicit `buttons` wins over the per-phase default. Pointer
// Events fires no `pointerdown` or `pointerup` for a button that changes state
// while another one stays held: the change rides on `pointermove`, and only the
// compatibility mouse events fire for each button. This is the sequence
// Chromium, Firefox, and WebKit produce for the same gesture.
// https://w3c.github.io/pointerevents/#chorded-button-interactions
test("mouseDown and mouseUp fire pointermove for a chorded button change", async () => {
  document.body.innerHTML = `<button type="button">Resize</button>`;

  const button = q.button.ensure("Resize");
  const events = recordPressEvents(button, chordEventTypes);

  // The primary button stays held while the secondary one is pressed and
  // released.
  await mouseDown(button);
  await mouseDown(button, { button: 2, buttons: 3 });
  await mouseUp(button, { button: 2, buttons: 1 });
  await mouseUp(button);

  expect(events).toEqual([
    "pointerdown 0 1",
    "mousedown 0 1",
    "pointermove 2 3",
    "mousedown 2 3",
    "pointermove 2 1",
    "mouseup 2 1",
    "pointerup 0 0",
    "mouseup 0 0",
  ]);
});

// Only a canceled `pointerdown` starts suppressing the compatibility mouse
// events, so canceling the `pointermove` a chorded change rides on leaves them
// firing.
// https://w3c.github.io/pointerevents/#mapping-for-devices-that-support-hover
test("a canceled pointermove keeps the mouse events of a chorded gesture", async () => {
  document.body.innerHTML = `<button type="button">Resize</button>`;

  const button = q.button.ensure("Resize");
  const events = recordPressEvents(button, chordEventTypes);
  button.addEventListener("pointermove", (event) => event.preventDefault());

  await mouseDown(button);
  await mouseDown(button, { button: 2, buttons: 3 });
  await mouseUp(button, { button: 2, buttons: 1 });
  await mouseUp(button);

  expect(events).toEqual([
    "pointerdown 0 1",
    "mousedown 0 1",
    "pointermove 2 3",
    "mousedown 2 3",
    "pointermove 2 1",
    "mouseup 2 1",
    "pointerup 0 0",
    "mouseup 0 0",
  ]);
});

// A canceled `pointerdown` suppresses the compatibility mouse events until the
// gesture ends, so the chorded press and release in between fire none either.
// Measured identically in Chromium, Firefox, and WebKit.
test("a canceled pointerdown suppresses the mouse events of a chorded gesture", async () => {
  document.body.innerHTML = `<button type="button">Resize</button>`;

  const button = q.button.ensure("Resize");
  const events = recordPressEvents(button, chordEventTypes);
  button.addEventListener("pointerdown", (event) => event.preventDefault());

  await mouseDown(button);
  await mouseDown(button, { button: 2, buttons: 3 });
  await mouseUp(button, { button: 2, buttons: 1 });
  await mouseUp(button);

  expect(events).toEqual([
    "pointerdown 0 1",
    "pointermove 2 3",
    "pointermove 2 1",
    "pointerup 0 0",
  ]);
});

// `select` runs every step from one init like `click` does, so it derives each
// step and ignores an explicit `buttons`.
test("select derives buttons from the button it presses", async () => {
  const paragraph = q.text.ensure(/Keep this/);
  const events = recordPressEvents(paragraph);

  await select(selectionText, paragraph, { buttons: 3 });

  expect(events).toEqual([
    "pointerdown 0 1",
    "mousedown 0 1",
    "pointerup 0 0",
    "mouseup 0 0",
  ]);
});
