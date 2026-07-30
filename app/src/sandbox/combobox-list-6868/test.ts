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
  expect(list).not.toHaveFocus();
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

// https://github.com/ariakit/ariakit/pull/6968#discussion_r3682117297
test("ignores an authored tabIndex", async () => {
  await click(q.combobox("Authored tab index fruit"));
  expect(q.combobox("Search Authored tab index fruit")).toHaveFocus();
  const list = q.listbox.ensure("Authored tab index fruit options");

  await press.Tab();
  expect(q.button("After Authored tab index fruit options")).toHaveFocus();
  expect(list).toHaveAttribute("tabindex", "-1");
});

test("moves focus from a standalone list to the combobox", async () => {
  const combobox = q.combobox.ensure("Standalone fruit");
  const list = q.listbox.ensure("Standalone fruit options");

  await click(list);
  expect(combobox).toHaveFocus();
});
