import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// examples/select-menu-default-open/test.ts
test("checkbox menu adds an open filter and commits its value", async () => {
  const filters = q.within(q.group("Checkbox filters"));
  await click(filters.button("Filters (0)"));
  await click(filters.menuitemcheckbox("Language"));

  const select = filters.combobox.ensure("Language:");
  expect(select).toHaveAttribute("aria-expanded", "true");
  expect(select).toHaveTextContent("Language: Choose one");
  const listbox = filters.listbox.ensure("Language:");
  const listboxQuery = q.within(listbox);
  await type("fr", select);
  expect(listboxQuery.option("French")).toHaveFocus();
  await press.Enter();
  expect(select).toHaveTextContent("Language: French");
  expect(filters.button("Filters (1)")).toBeVisible();
});

// examples/select-menu-default-open-click/test.ts
test("click menu removes an uncommitted filter on outside click", async () => {
  const filters = q.within(q.group("Click filters"));
  await click(filters.button("Filters (0)"));
  await click(filters.menuitem("Language"));

  expect(filters.combobox("Language:")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await click(document.body);
  expect(filters.button("Filters (0)")).toBeVisible();
  expect(filters.combobox("Language:")).not.toBeInTheDocument();
});
