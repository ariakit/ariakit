import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("starts without filters", () => {
  expect(
    q.within(q.group("Checkbox filters")).button("Filters (0)"),
  ).toBeVisible();
  expect(
    q.within(q.group("Click filters")).button("Filters (0)"),
  ).toBeVisible();
});

// examples/select-menu-default-open/test.ts
test("checkbox menu adds an open filter and commits its value", async () => {
  const filters = q.within(q.group("Checkbox filters"));
  await click(filters.button("Filters (0)"));
  await click(filters.menuitemcheckbox("Language"));

  const select = filters.combobox("Language:");
  expect(select).toHaveAttribute("aria-expanded", "true");
  expect(select).toHaveTextContent("Language: Choose one");
  const listbox = filters.listbox("Language:");
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
  expect(filters.combobox.maybe("Language:")).not.toBeInTheDocument();
});

for (const mode of ["Checkbox", "Click"]) {
  test(`${mode.toLowerCase()} menu removes an uncommitted keyboard filter`, async () => {
    const filters = q.within(q.group(`${mode} filters`));

    await click(filters.button("Filters (0)"));
    await click(
      mode === "Checkbox" ? q.menuitemcheckbox("Status") : q.menuitem("Status"),
    );
    expect(filters.combobox("Status:")).toHaveFocus();
    await press.Tab();
    await expect
      .poll(() => filters.combobox.maybe("Status:"))
      .not.toBeInTheDocument();
    expect(filters.button("Filters (0)")).toBeVisible();
  });
}

test("click menu manages multiple filters", async () => {
  const filters = q.within(q.group("Click filters"));

  await click(filters.button("Filters (0)"));
  await click(q.menuitem("Language"));
  await type("fr", filters.combobox("Language:"));
  await press.Enter();
  expect(filters.combobox("Language:")).toHaveTextContent("Language: French");

  await click(filters.button("Filters (1)"));
  await click(q.menuitem("Author"));
  await type("ja", filters.combobox("Author:"));
  expect(q.option("Jane Doe")).toHaveFocus();
  await press.Enter();
  expect(filters.combobox("Author:")).toHaveTextContent("Author: Jane Doe");
  expect(filters.button("Filters (2)")).toBeVisible();

  await click(filters.button("Remove Language filter"));
  expect(filters.combobox.maybe("Language:")).not.toBeInTheDocument();
  await click(filters.button("Filters (1)"));
  await click(q.menuitem("Clear all"));
  expect(filters.button("Filters (0)")).toHaveFocus();
});
