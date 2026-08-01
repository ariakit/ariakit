import { click, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("forwards nested trigger ids and refs", async () => {
  await click(q.button("Options"));
  const bookmarksButton = q.menuitem("Bookmarks");
  expect(bookmarksButton).toHaveAttribute(
    "data-ref-id",
    "bookmarks-menu-button",
  );
  expect(bookmarksButton).toHaveAttribute("id", "bookmarks-menu-button");
});

test("runs consumer events before menu item behavior", async () => {
  await click(q.button("Options"));
  const bookmarksButton = q.menuitem("Bookmarks");
  await focus(bookmarksButton);
  await press.ArrowDown();
  expect(bookmarksButton).toHaveFocus();
});
