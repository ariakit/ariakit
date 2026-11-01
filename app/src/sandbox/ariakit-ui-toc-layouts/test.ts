import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("keeps every level of a deep list in nested lists", () => {
  const nav = q.within(q.navigation("Five levels"));
  const link = nav.link("In a workspace");
  let depth = 0;
  for (let node: Element | null = link; node; node = node.parentElement) {
    if (node.matches("ul, ol")) {
      depth++;
    }
  }
  expect(depth).toBe(5);
});

test("orders the chapters with two-digit numbers out of the link names", () => {
  const nav = q.navigation("Twelve chapters");
  expect(q.within(nav).list()).toHaveProperty("tagName", "OL");
  expect(q.within(nav).link("Chapter 12")).toHaveAccessibleName("Chapter 12");
});
