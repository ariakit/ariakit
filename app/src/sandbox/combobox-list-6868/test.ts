import { click, focus, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6868
test("skips the list by default", async () => {
  await click(q.combobox("Default fruit"));
  expect(q.combobox("Search Default fruit")).toHaveFocus();
  const list = q.listbox.ensure("Default fruit options");
  expect(list).toHaveAttribute("tabindex", "-1");

  await press.Tab();
  expect(q.button("After Default fruit options")).toHaveFocus();

  await focus(list);
  expect(list).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/6868
test("skips an empty list by default", async () => {
  await click(q.combobox("Default fruit"));
  const input = q.combobox.ensure("Search Default fruit");
  await type("zzzz", input);
  expect(q.status()).toHaveTextContent("No results");
  const list = q.listbox.ensure("Default fruit options");
  expect(list).toHaveAttribute("tabindex", "-1");

  await press.Tab();
  expect(q.button("After Default fruit options")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/6868
test("supports opting into the tab order", async () => {
  await click(q.combobox("Opt-in fruit"));
  expect(q.combobox("Search Opt-in fruit")).toHaveFocus();
  const list = q.listbox.ensure("Opt-in fruit options");
  expect(list).toHaveAttribute("tabindex", "0");

  await press.Tab();
  expect(list).toHaveFocus();
});
