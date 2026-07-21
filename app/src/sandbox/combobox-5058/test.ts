import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/5058
test("mirrors every selected value in the form control", async () => {
  await click(q.combobox("Favorite fruits"));
  await click(q.option("Apple"));
  await click(q.option("Orange"));

  expect(q.combobox("Favorite fruits")).not.toHaveAttribute("name");

  const input = q.combobox("Favorite fruits") as HTMLInputElement;
  const form = input.form!;
  expect(new FormData(form).getAll("fruits")).toEqual(["apple", "orange"]);
});

// https://github.com/ariakit/ariakit/pull/6795#discussion_r3623740406
test("mirrors selected values when composite is false", () => {
  const form = q.form("Non-composite fruits") as HTMLFormElement;
  const formData = new FormData(form);
  const input = q.combobox("Non-composite fruits") as HTMLInputElement;

  expect(formData.getAll("non-composite-fruits")).toEqual(["apple"]);
  expect(input.form).toBe(form);
});

// https://github.com/ariakit/ariakit/pull/6795#discussion_r3625787623
test("omits aria-disabled selected values", () => {
  const form = q.form.ensure("Disabled fruits") as HTMLFormElement;

  expect(q.combobox("Disabled fruits")).toBeDisabled();
  expect(new FormData(form).getAll("disabled-fruits")).toEqual([]);
});

test("preserves the name for a single selected value", () => {
  expect(q.combobox("Single fruit")).toHaveAttribute("name", "single-fruit");
});
