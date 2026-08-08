import { afterEach, expect, test } from "vitest";
import { click, q } from "./index.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

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

test("clicking an option preserves the simulated pointer and focus sequence", async () => {
  document.body.innerHTML = `
      <label for="fruit">Fruit</label>
      <select id="fruit">
        <option>Apple</option>
        <option>Banana</option>
      </select>
    `;

  const select = q.combobox.ensure("Fruit");
  const option = q.option.ensure("Banana");
  const events: string[] = [];
  for (const type of [
    "pointerover",
    "mouseover",
    "pointerdown",
    "mousedown",
    "pointerup",
    "mouseup",
    "click",
  ]) {
    option.addEventListener(type, (event) => events.push(event.type));
  }
  select.addEventListener("focus", (event) => events.push(event.type));
  select.addEventListener("input", (event) => events.push(event.type));
  select.addEventListener("change", (event) => events.push(event.type));

  await click(option);

  expect(select).toHaveFocus();
  expect(events).toEqual([
    "pointerover",
    "mouseover",
    "pointerdown",
    "mousedown",
    "focus",
    "pointerup",
    "mouseup",
    "input",
    "change",
    "click",
  ]);
});
