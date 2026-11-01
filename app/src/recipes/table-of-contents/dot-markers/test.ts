import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("keeps every list unordered", () => {
  const nav = q.navigation("On this page");
  const lists = q.within(nav).list.all();
  expect(lists.map((list) => list.tagName)).toEqual(["UL", "UL", "UL"]);
});
