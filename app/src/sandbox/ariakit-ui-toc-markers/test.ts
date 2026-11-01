import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("orders only the rows of a nested ordered list", () => {
  const nav = q.navigation("Numbered steps");
  const lists = q.within(nav).list.all();
  expect(lists.map((list) => list.tagName)).toEqual(["UL", "OL", "UL"]);
});

test("keeps the lists with dots unordered", () => {
  const nav = q.navigation("Dot steps");
  const lists = q.within(nav).list.all();
  expect(lists.map((list) => list.tagName)).toEqual(["UL", "UL", "UL"]);
});
