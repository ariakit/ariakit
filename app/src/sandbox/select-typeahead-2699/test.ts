import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/2699
test("matches custom item content while open", async () => {
  await press.Tab();
  await press.Enter();
  expect(q.option("Brazil")).toHaveAttribute("data-active-item");

  await press("c");

  expect(q.option("Canada")).toHaveAttribute("data-active-item");
});

test("matches custom item content while closed", async () => {
  await press.Tab();

  await press("c");

  expect(q.combobox("Country")).toHaveTextContent("Canada");
  expect(q.listbox()).not.toBeInTheDocument();
});
