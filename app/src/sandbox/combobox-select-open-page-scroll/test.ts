import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6986
test("waits for positioning and abandons focus when ownership leaves", async () => {
  const select = q.combobox("Delayed branch");
  const leave = q.button("Leave and release positioning");

  expect(
    q.combobox("Search delayed branches", { hidden: true }),
  ).not.toBeInTheDocument();

  await click(select);

  const search = q.combobox("Search delayed branches", { hidden: true });
  expect(q.text("Positioning: yes")).toBeVisible();
  expect(search).toBeInTheDocument();
  expect(select).toHaveFocus();
  expect(search).not.toHaveFocus();

  await click(leave);

  expect(q.text("Positioning: no")).toBeVisible();
  expect(leave).toHaveFocus();
  expect(search).not.toHaveFocus();
});
