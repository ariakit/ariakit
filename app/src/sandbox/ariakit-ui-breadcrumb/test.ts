import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("marks only the link of the current URL", () => {
  const trail = q.within(q.navigation("Current page as a link"));
  expect(trail.link("Tools")).toHaveAttribute("aria-current", "page");
  expect(trail.link("Garden")).not.toHaveAttribute("aria-current");
});

test("shows a level without a page as a step that isn't a link or the page", () => {
  const trail = q.within(q.navigation("Level without a page"));
  expect(trail.listitem.all()).toHaveLength(3);
  expect(trail.link.maybe("Tools")).not.toBeInTheDocument();
  expect(trail.text("Tools")).not.toHaveAttribute("aria-current");
  expect(trail.text("Shears")).toHaveAttribute("aria-current", "page");
});

test("hides a plain element passed to separator", () => {
  const trail = q.within(q.navigation("Separator element"));
  expect(trail.listitem.all()).toHaveLength(2);
  expect(trail.text("›")).toHaveAttribute("aria-hidden", "true");
});
