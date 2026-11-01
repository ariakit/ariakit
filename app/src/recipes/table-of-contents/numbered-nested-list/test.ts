import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("orders only the nested list of steps", () => {
  const nav = q.navigation("Tutorial");
  const lists = q.within(nav).list.all();
  expect(lists.map((list) => list.tagName)).toEqual(["UL", "OL"]);
});

test("keeps the numbers out of the link names", () => {
  const nav = q.within(q.navigation("Tutorial"));
  expect(nav.link("Add the database")).toHaveAccessibleName("Add the database");
});
