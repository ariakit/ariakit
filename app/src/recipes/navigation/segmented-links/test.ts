import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("renders links in a navigation landmark and marks the current one", async () => {
  const nav = q.within(q.navigation("Feed"));
  expect(nav.link("For you")).toHaveAttribute("aria-current", "page");
  await click(nav.link("Following"));
  expect(nav.link("Following")).toHaveAttribute("aria-current", "page");
  expect(nav.link("For you")).not.toHaveAttribute("aria-current");
});
