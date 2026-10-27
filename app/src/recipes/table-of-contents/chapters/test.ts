import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("orders the chapters with an ordered list", () => {
  const nav = q.navigation("Chapters");
  const [root, ...nested] = q.within(nav).list.all();
  expect(root?.tagName).toBe("OL");
  expect(nested.map((list) => list.tagName)).toEqual(["UL", "UL", "UL"]);
});

test("keeps the numbers out of the link names", () => {
  const nav = q.within(q.navigation("Chapters"));
  expect(nav.link("Basics")).toHaveAccessibleName("Basics");
  expect(nav.link("Working with data")).toHaveAccessibleName(
    "Working with data",
  );
});
