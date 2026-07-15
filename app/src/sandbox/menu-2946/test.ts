import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/2946#issuecomment-4977621514
test("focuses a conditionally mounted menu that opens by default", async () => {
  await click(q.button("Add item"));

  const menu = q.menu("Actions for new item");
  expect(menu).toBeVisible();
  expect(menu).toHaveFocus();
  expect(q.menuitem("Rename")).not.toHaveAttribute("data-active-item");
});

test("respects autofocus opt-out when mounting open", async () => {
  await click(q.button("Add passive item"));

  expect(q.menu("Actions for new item")).toBeVisible();
  expect(document.body).toHaveFocus();
});
