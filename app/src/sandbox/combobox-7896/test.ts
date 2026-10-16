import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7896
test("keyboard navigation follows reordered items", async () => {
  const combobox = q.combobox("Project");
  await click(combobox);
  const popover = q.listbox("Projects");

  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.option("Beta")).toHaveAttribute("data-active-item");

  await click(q.button("Refresh results"));
  const options = q.within(popover).option.all();
  expect(options.map((option) => option.textContent)).toEqual([
    "Alpha",
    "Beta",
    "Delta",
    "Charlie",
  ]);
  expect(combobox).toHaveFocus();
  expect(q.option("Beta")).toHaveAttribute("data-active-item");

  await press.ArrowDown();
  expect(q.option("Delta")).toHaveAttribute("data-active-item");

  await press.Enter();
  expect(q.text("Selected project:")).toHaveTextContent(
    "Selected project: Delta",
  );
});
