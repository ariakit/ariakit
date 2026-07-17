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

// https://github.com/ariakit/ariakit/issues/6733
test("typeahead updates the value for late unmounted items", async () => {
  await click(q.button("Load fruit options"));

  const select = q.combobox.ensure("Fruit");
  expect(select).toHaveFocus();
  expect(q.option("Apple")).not.toBeInTheDocument();
  expect(q.status("Fruit active item")).toHaveTextContent("orange");
  expect(select).toHaveTextContent("Orange");

  await press("a", select);

  expect(q.status("Fruit active item")).toHaveTextContent("apple");
  expect(select).toHaveTextContent("Apple");
});

// https://github.com/ariakit/ariakit/issues/6733
test("typeahead updates the value for late SelectRenderer items", async () => {
  await click(q.button("Load rendered fruit options"));

  const select = q.combobox.ensure("Rendered fruit");
  expect(select).toHaveFocus();
  expect(q.option("Apple")).not.toBeInTheDocument();
  expect(q.status("Rendered fruit active item")).toHaveTextContent("orange");
  expect(select).toHaveTextContent("Orange");

  await press("a", select);

  expect(q.status("Rendered fruit active item")).toHaveTextContent("apple");
  expect(select).toHaveTextContent("Apple");
});
