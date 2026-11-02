import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test.each(["Slash", "Chevron", "Pipe", "Dot"])(
  "keeps the marks of the %s trail hidden",
  (name) => {
    const trail = q.within(q.navigation(name));
    expect(trail.listitem.all()).toHaveLength(3);
    expect(q.navigation(name)).toHaveTextContent(/Garden/);
  },
);

test("shows a custom mark in the children", () => {
  expect(q.navigation("Dot")).toHaveTextContent("·");
});
