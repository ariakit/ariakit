import { beforeEach, expect, test } from "vitest";
import { click } from "./click.ts";
import { mouseDown } from "./mouse-down.ts";
import { mouseUp } from "./mouse-up.ts";
import { q } from "./query.ts";
import { select } from "./select.ts";
import "./shims.ts";

const selectionText = "sample paragraph text";

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
