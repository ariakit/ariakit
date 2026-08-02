import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6986
test("moves focus through the menu while its store is closed", async () => {
  const save = q.menuitem.ensure("Save");
  const close = q.menuitem.ensure("Close");

  await click(save);
  expect(save).toHaveFocus();

  await press.ArrowDown();
  await press.ArrowDown();

  expect(close).toHaveAttribute("data-active-item");
  expect(close).toHaveFocus();
});
