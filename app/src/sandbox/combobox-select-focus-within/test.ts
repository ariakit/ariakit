import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// examples/select-combobox-focus-within/test.ts
test("shows and hides the cancel button with popover focus", async () => {
  const select = q.combobox("Favorite fruit");
  await click(select);
  const search = q.combobox.ensure("Search...");
  const cancel = q.button("Clear input");
  expect(search).toHaveFocus();
  expect(cancel).toHaveAttribute("data-visible");

  await press.Tab();
  expect(cancel).toHaveFocus();
  expect(cancel).toHaveAttribute("data-visible");
  await press.Enter();
  expect(search).toHaveFocus();
  expect(cancel).toHaveAttribute("data-visible");

  await press.ShiftTab();
  expect(select).toHaveFocus();
  expect(cancel).not.toHaveAttribute("data-visible");
  await type("b");
  expect(search).toHaveFocus();
  expect(q.option("Bacon")).toHaveFocus();
  expect(cancel).toHaveAttribute("data-visible");

  await type("ho");
  await press.ShiftTab();
  expect(select).toHaveFocus();
  expect(cancel).toHaveAttribute("data-visible");
  await click(cancel);
  expect(search).toHaveFocus();
  expect(search).toHaveValue("");
  expect(cancel).toHaveAttribute("data-visible");

  await press.Tab();
  expect(cancel).toHaveFocus();
  await press.Tab();
  expect(q.dialog()).not.toBeInTheDocument();
});

// examples/select-combobox-focus-within/test.ts
test("tracks focus within the select composition", async () => {
  const group = q.group();
  expect(group).not.toHaveClass("focus-within");
  await press.Tab();
  expect(group).toHaveClass("focus-within");
  await press.Tab();
  expect(group).not.toHaveClass("focus-within");
  await press.ShiftTab();
  expect(group).toHaveClass("focus-within");
  await press.Enter();
  await press.Tab();
  await press.Tab();
  expect(group).not.toHaveClass("focus-within");
});
