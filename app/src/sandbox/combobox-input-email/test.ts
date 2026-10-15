import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/3086
test("moves focus back to the email input when typing on an item", async () => {
  const combobox = q.combobox("Real focus email");
  await click(combobox);
  await type("e");
  await press.ArrowDown();
  expect(q.option("real-focus-email1@ariakit.com")).toHaveFocus();

  await type("2");

  expect(combobox).toHaveFocus();
  expect(combobox).toHaveValue("e2");
});
