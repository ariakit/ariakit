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

// https://github.com/ariakit/ariakit/pull/6795#discussion_r3623740406
test("mirrors selected values when composite is false", () => {
  const form = document.querySelector<HTMLFormElement>(
    "form[data-composite-false]",
  );
  const formData = new FormData(form!);

  expect(formData.getAll("non-composite-fruits")).toEqual(["apple"]);
});

// https://github.com/ariakit/ariakit/pull/6795#discussion_r3623740398
test("relays invalid events to the Combobox input", async () => {
  await click(q.button("Validate required fruits"));

  expect(q.text("Invalid target: input")).toBeInTheDocument();
});
