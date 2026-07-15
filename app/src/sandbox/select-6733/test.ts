import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6733
test("typeahead updates the value for late unmounted items", async () => {
  await click(q.button("Load fruit options"));

  const select = q.combobox.ensure("Fruit");
  expect(select).toHaveFocus();
  expect(q.option("Apple")).not.toBeInTheDocument();

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

  await press("a", select);

  expect(q.status("Rendered fruit active item")).toHaveTextContent("apple");
  expect(select).toHaveTextContent("Apple");
});
