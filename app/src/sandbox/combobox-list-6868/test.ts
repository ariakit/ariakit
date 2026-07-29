import { click, press, q } from "@ariakit/test";
import { expect, test, vi } from "vitest";

// https://github.com/ariakit/ariakit/issues/6868
test("tabs to a non-scrollable list with real focus", async () => {
  await click(q.combobox.ensure("Real focus fruit"));
  expect(q.combobox("Search Real focus fruit")).toHaveFocus();

  await press.Tab();
  expect(q.button("Review Real focus fruit options")).toHaveFocus();

  await press.Tab();
  const list = q.listbox.ensure("Real focus fruit");
  expect(list).toHaveFocus();
  expect(q.status("Real focus fruit base element")).toHaveTextContent(
    "combobox",
  );

  await press.ArrowDown();
  expect(q.within(list).option("Apple")).toHaveFocus();

  await press.ArrowDown();
  expect(q.within(list).option("Banana")).toHaveFocus();
});

test("tabs to a non-scrollable list with virtual focus", async () => {
  await click(q.combobox.ensure("Virtual focus fruit"));
  const input = q.combobox.ensure("Search Virtual focus fruit");
  expect(input).toHaveFocus();

  await press.Tab();
  expect(q.button("Review Virtual focus fruit options")).toHaveFocus();

  await press.Tab();
  const list = q.listbox.ensure("Virtual focus fruit");
  expect(list).toHaveFocus();
  expect(q.status("Virtual focus fruit base element")).toHaveTextContent(
    "combobox",
  );

  const apple = q.within(list).option.ensure("Apple");
  const onAppleFocus = vi.fn();
  apple.addEventListener("focus", onAppleFocus);

  await press.ArrowDown();
  expect(input).toHaveFocus();
  expect(apple).toHaveAttribute("data-focus-visible", "true");
  expect(onAppleFocus).toHaveBeenCalledTimes(1);

  const banana = q.within(list).option.ensure("Banana");
  const onBananaFocus = vi.fn();
  banana.addEventListener("focus", onBananaFocus);

  await press.ArrowDown();
  expect(input).toHaveFocus();
  expect(banana).toHaveAttribute("data-focus-visible", "true");
  expect(onBananaFocus).toHaveBeenCalledTimes(1);
});
