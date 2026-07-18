// @vitest-environment jsdom

import { afterEach, expect, test } from "vitest";
import { click, q } from "./index.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

function setupMultiSelect() {
  document.body.innerHTML = `
    <label for="fruits">Fruits</label>
    <select id="fruits" multiple size="3">
      <option>Apple</option>
      <option selected>Banana</option>
      <option>Cherry</option>
    </select>
  `;
}

function getSelect() {
  return q.listbox.ensure("Fruits") as HTMLSelectElement;
}

function getSelectedValues() {
  return Array.from(getSelect().options)
    .filter((option) => option.selected)
    .map((option) => option.value);
}

function getDefaultSelectedValues() {
  return Array.from(getSelect().options)
    .filter((option) => option.defaultSelected)
    .map((option) => option.value);
}

test("clicking options does not change their default selectedness", async () => {
  setupMultiSelect();

  await click(q.option("Apple"));
  await click(q.option("Cherry"), { ctrlKey: true });
  await click(q.option("Apple"), { ctrlKey: true });

  expect(getSelectedValues()).toEqual(["Cherry"]);
  expect(getDefaultSelectedValues()).toEqual(["Banana"]);
  expect(q.option("Apple")).not.toHaveAttribute("selected");
  expect(q.option("Banana")).toHaveAttribute("selected");
  expect(q.option("Cherry")).not.toHaveAttribute("selected");
});

test("anchorless shift-click anchors at the first selected option", async () => {
  setupMultiSelect();

  await click(q.option("Cherry"), { shiftKey: true });

  expect(getSelectedValues()).toEqual(["Banana", "Cherry"]);
  expect(getDefaultSelectedValues()).toEqual(["Banana"]);
});
