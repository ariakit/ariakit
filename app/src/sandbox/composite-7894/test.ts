import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

const grids = ["Vertical contacts", "Horizontal contacts", "Both contacts"];

function getFields(grid: string) {
  const query = q.within(q.grid(grid));
  return {
    firstName: query.textbox("First contact name"),
    firstNotes: query.textbox("First contact notes"),
    secondNotes: query.textbox("Second contact notes"),
  };
}

function getCaret(element: HTMLElement) {
  if (!("selectionStart" in element)) return null;
  return element.selectionStart;
}

// https://github.com/ariakit/ariakit/issues/7894
test("Left and Right move the text cursor before leaving the field", async () => {
  for (const grid of grids) {
    const { firstName, firstNotes } = getFields(grid);

    await click(firstName);
    await type("ab");
    await press.ArrowLeft();
    expect(firstName).toHaveFocus();
    expect(getCaret(firstName)).toBe(1);

    await press.ArrowRight();
    expect(firstName).toHaveFocus();
    expect(getCaret(firstName)).toBe(2);

    await press.ArrowRight();
    expect(firstNotes).toHaveFocus();

    await type("cd");
    await press.ArrowLeft();
    expect(firstNotes).toHaveFocus();
    expect(getCaret(firstNotes)).toBe(1);

    await press.ArrowLeft();
    expect(firstNotes).toHaveFocus();
    expect(getCaret(firstNotes)).toBe(0);

    await press.ArrowLeft();
    expect(firstName).toHaveFocus();
  }
});

// https://github.com/ariakit/ariakit/issues/7894
test("Up and Down move the text cursor before leaving the field", async () => {
  for (const grid of grids) {
    const { firstNotes, secondNotes } = getFields(grid);

    await click(firstNotes);
    await type("ab\ncd");
    // The @ariakit/test emulation of Up moves the cursor to the start of the
    // text, while browsers move it to the previous line.
    await press.ArrowUp();
    expect(firstNotes).toHaveFocus();
    expect(getCaret(firstNotes)).toBe(0);

    await press.ArrowDown();
    expect(firstNotes).toHaveFocus();
    expect(getCaret(firstNotes)).toBe(5);

    await press.ArrowDown();
    expect(secondNotes).toHaveFocus();

    await type("\ngh");
    await press.ArrowUp();
    expect(secondNotes).toHaveFocus();
    expect(getCaret(secondNotes)).toBe(0);

    await press.ArrowUp();
    expect(firstNotes).toHaveFocus();
  }
});
