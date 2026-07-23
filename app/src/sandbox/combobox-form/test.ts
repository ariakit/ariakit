import { click, press, q, type } from "@ariakit/test";
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

// https://github.com/ariakit/ariakit/issues/1861
test("resets an uncontrolled combobox with a native reset button", async () => {
  const name = q.textbox.ensure("Name");
  const homeTown = q.combobox.ensure("Home town");

  await type("Chance", name);
  await type("Boston", homeTown);
  await press("Escape", homeTown);
  await click(q.button("Reset address"));

  expect(name).toHaveValue("");
  expect(homeTown).toHaveValue("");
});

// https://github.com/ariakit/ariakit/issues/1861
test("resets a combobox to its default value", async () => {
  const birthPlace = q.combobox.ensure("Birth place");

  await type("San Diego", birthPlace);
  await press("Escape", birthPlace);
  await click(q.button("Reset address"));

  expect(birthPlace).toHaveValue("Boston");
});
