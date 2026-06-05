import { expect, test } from "vitest";
import { mouseDown } from "./mouse-down.ts";
import { q } from "./query.ts";
import { select } from "./select.ts";

const selectionText = "sample paragraph text";

function setup() {
  document.body.innerHTML = `
    <p>Keep this ${selectionText} selected.</p>
    <button type="button">Preserve selection</button>
    <label>
      Editable target
      <input />
    </label>
    <p>Plain text target</p>
  `;
}

async function selectParagraphText() {
  await select(selectionText, q.text.ensure(/Keep this/));
  expect(document.getSelection()?.toString()).toBe(selectionText);
}

test("mouseDown on a button preserves the document selection", async () => {
  setup();
  await selectParagraphText();
  await mouseDown(q.button("Preserve selection"));
  expect(document.getSelection()?.toString()).toBe(selectionText);
});

test("mouseDown on an editable target clears the document selection", async () => {
  setup();
  await selectParagraphText();
  await mouseDown(q.textbox("Editable target"));
  expect(document.getSelection()?.toString()).toBe("");
});

test("mouseDown on a plain text target clears the document selection", async () => {
  setup();
  await selectParagraphText();
  await mouseDown(q.text("Plain text target"));
  expect(document.getSelection()?.toString()).toBe("");
});
