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
  let changedSelection: string[] = [];
  select.addEventListener("change", (event) => {
    const target = event.target as HTMLSelectElement;
    changedSelection = Array.from(
      target.selectedOptions,
      (option) => option.value,
    );
  });

  await click(q.option.ensure("Date"), { shiftKey: true });

  expect(changedSelection).toEqual(["Banana", "Cherry", "Date"]);
});
