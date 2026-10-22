import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("moves the current page to the clicked link", async () => {
  const nav = q.within(q.navigation("Main"));
  expect(nav.link("Home")).toHaveAttribute("aria-current", "page");
  await click(nav.link("Inbox"));
  expect(nav.link("Inbox")).toHaveAttribute("aria-current", "page");
  expect(nav.link("Home")).not.toHaveAttribute("aria-current");
});

test("describes a link by the count on its icon", () => {
  const nav = q.within(q.navigation("Main"));
  expect(nav.link("Inbox")).toHaveAccessibleDescription("3 unread");
});
