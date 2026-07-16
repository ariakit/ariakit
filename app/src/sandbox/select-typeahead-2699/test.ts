import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/2699
test("matches custom item content and skips empty text while open", async () => {
  await press.Tab();
  await press.Enter();
  expect(q.option("Brazil")).toHaveAttribute("data-active-item");

  await press("c");

  expect(q.option("Citrus")).not.toHaveAttribute("data-active-item");
  expect(q.option("Canada")).toHaveAttribute("data-active-item");
});

test("matches custom item content while closed", async () => {
  await press.Tab();

  await press("c");

  expect(q.combobox(/^Country$/)).toHaveTextContent("Canada");
  expect(q.listbox()).not.toBeInTheDocument();
});

test("updates custom item text", async () => {
  await click(q.button("Use country aliases"));
  await click(q.combobox(/^Country$/));

  await press("d");

  expect(q.option("Canada")).toHaveAttribute("data-active-item");
});

test("matches custom content on an offscreen item", async () => {
  await click(q.combobox(/^Virtualized country$/));
  expect(q.option("Canada")).toHaveAttribute("data-offscreen");

  await press("c");

  expect(q.option("Canada")).toHaveAttribute("data-active-item");
});
