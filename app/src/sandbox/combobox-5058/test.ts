import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/5058
test("mirrors every selected value in the form control", async () => {
  await click(q.combobox("Favorite fruits"));
  await click(q.option("Apple"));
  await click(q.option("Orange"));

  expect(q.combobox("Favorite fruits")).not.toHaveAttribute("name");

  const select = document.querySelector<HTMLSelectElement>(
    "select[name='fruits'][multiple]",
  );
  const selectedValues = Array.from(
    select?.selectedOptions ?? [],
    (option) => option.value,
  );
  expect(selectedValues).toEqual(["apple", "orange"]);
});
