import { press, q, sleep, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("typeahead open", async () => {
  await press.Tab();
  await press.Enter();
  await type("c");
  expect(q.option("🇨🇦 Canada")).toHaveFocus();
  expect(q.option("🇧🇷 Brazil", { selected: true })).toBeVisible();
  expect(q.option("🇨🇦 Canada", { selected: false })).toBeVisible();
  await sleep(600);
  await type("uni");
  expect(q.option("🇺🇸 United States")).toHaveFocus();
  expect(q.option("🇧🇷 Brazil", { selected: true })).toBeVisible();
  expect(q.option("🇺🇸 United States", { selected: false })).toBeVisible();
});

test("typeahead hidden", async () => {
  await press.Tab();
  await type("v");
  expect(q.combobox()).toHaveTextContent("Brazil");
  expect(q.listbox()).not.toBeInTheDocument();
  await sleep(600);
  await type("can");
  expect(q.combobox()).toHaveTextContent("Canada");
  expect(q.listbox()).not.toBeInTheDocument();
});
