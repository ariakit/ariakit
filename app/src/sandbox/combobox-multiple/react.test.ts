import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7114
test("extends an explicitly composed editable selection with Shift", async () => {
  await click(q.combobox("Your favorite food"));
  await click(q.option("Banana"));
  await click(q.option("Cake"), { shiftKey: true });

  expect(q.status("Editable selection")).toHaveTextContent(
    "5 selected: Bacon, Banana, Broccoli, Burger, Cake",
  );
  expect(q.option("Broccoli")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Burger")).toHaveAttribute("aria-selected", "true");
});

// https://github.com/ariakit/ariakit/issues/7114
test("maps duplicate rows to one selected value", async () => {
  const combobox = q.combobox("Your favorite food");
  await click(combobox);
  await type("apple", combobox);

  await click(q.option("Apple"));
  expect(q.status("Editable selection")).toHaveTextContent(
    "2 selected: Bacon, Apple",
  );
  await type("apple", combobox);
  await expect.poll(q.option.lazy("Apple — market pick")).toBeInTheDocument();
  const apple = q.option("Apple");
  const duplicateApple = q.option("Apple — market pick");
  expect(apple).toHaveAttribute("aria-selected", "true");
  expect(duplicateApple).toHaveAttribute("aria-selected", "true");

  await click(duplicateApple);
  expect(q.status("Editable selection")).toHaveTextContent("1 selected: Bacon");
  expect(apple).toHaveAttribute("aria-selected", "false");
  expect(duplicateApple).toHaveAttribute("aria-selected", "false");
});

// https://github.com/ariakit/ariakit/issues/7114
test("retains selected values hidden by filtering", async () => {
  const combobox = q.combobox("Your favorite food");
  await click(combobox);
  await click(q.option("Burger"));
  await type("app", combobox);

  await expect.poll(q.option.lazy("Apple")).toBeInTheDocument();
  expect(q.option.maybe("Burger")).not.toBeInTheDocument();
  expect(q.status("Editable selection")).toHaveTextContent(
    "2 selected: Bacon, Burger",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("keeps disabled handlers inert and the legacy toggle working", async () => {
  await click(q.combobox("Your favorite food"));
  const selection = q.status("Editable selection");

  await click(q.option("Native handler off"));
  expect(selection).toHaveTextContent("1 selected: Bacon");
  expect(q.status("Gate calls")).toHaveTextContent("Gate callback calls: 1");

  await click(q.option("Composite opt-out"));
  expect(selection).toHaveTextContent("1 selected: Bacon");

  await click(q.option("Legacy toggle"));
  expect(selection).toHaveTextContent("2 selected: Bacon, Legacy toggle");
});

// https://github.com/ariakit/ariakit/issues/7114
test("excludes an explicitly ineligible item from a Shift range", async () => {
  await click(q.combobox("Your favorite food"));
  await click(q.option("Range start"));
  await click(q.option("Range end"), { shiftKey: true });

  expect(q.status("Editable selection")).toHaveTextContent(
    "3 selected: Bacon, Range start, Range end",
  );
  expect(q.option("Composite opt-out")).toHaveAttribute(
    "aria-selected",
    "false",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("keeps modified Combobox link navigation outside selection", async () => {
  await click(q.combobox("Your favorite food"));
  const guide = q.option("Selection guide");
  const selection = q.status("Editable selection");
  const newTabModifier = navigator.platform.startsWith("Mac")
    ? { metaKey: true }
    : { ctrlKey: true };

  expect(guide).toHaveAttribute("href", "#selection-contract");
  await click(guide, newTabModifier);
  expect(guide).toHaveAttribute("aria-selected", "false");
  expect(selection).toHaveTextContent("1 selected: Bacon");

  await click(guide, { altKey: true });
  expect(guide).toHaveAttribute("aria-selected", "false");
  expect(selection).toHaveTextContent("1 selected: Bacon");
});
