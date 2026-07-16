import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/5179
test("lets a child handle Escape before the dialog", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();
  expect(q.combobox("Search")).toHaveFocus();
  expect(q.listbox("Suggestions")).toBeVisible();

  await press.Escape();

  expect(q.listbox("Suggestions")).not.toBeInTheDocument();
  expect(q.dialog("Dialog")).toBeVisible();

  await press.Escape();

  expect(q.dialog("Dialog")).not.toBeInTheDocument();
});

test("hides before an outside ancestor handles Escape", async () => {
  await click(q.button("Open outer ancestor dialog"));
  expect(q.dialog("Outer ancestor dialog")).toBeVisible();
  expect(q.combobox("Search")).toHaveFocus();

  await press.Escape();

  expect(q.listbox("Suggestions")).not.toBeInTheDocument();
  expect(q.dialog("Outer ancestor dialog")).toBeVisible();

  await press.Escape();

  expect(q.dialog("Outer ancestor dialog")).not.toBeInTheDocument();
});
