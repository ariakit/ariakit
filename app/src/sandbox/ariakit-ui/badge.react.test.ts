import { q } from "@ariakit/test";
import { expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { BadgeExamples } from "./pages/badge.react.tsx";

mountExamples(BadgeExamples);

test("a badge in running text is phrasing content", () => {
  const box = q.within(q.article("In running text"));
  const badge = box.text("v0.2").parentElement;
  expect(badge?.tagName).toBe("SPAN");
  expect(badge?.parentElement?.tagName).toBe("P");
});

test("a heading holds the badge as phrasing content", () => {
  const heading = q
    .within(q.article("Auto size in a heading"))
    .heading(/^Changelog/);
  expect(heading.querySelector(":scope > div")).toBeNull();
  expect(q.within(heading).text("Latest").parentElement?.tagName).toBe("SPAN");
});

test("a trailing count sits in an element of its own", () => {
  // The badge kind sizes an element child of the slot, which a bare text node
  // is not.
  const count = q.within(q.article("Trailing count")).text("12");
  expect(count.tagName).toBe("SPAN");
  expect(count.parentElement?.tagName).toBe("SPAN");
  expect(count.parentElement?.firstElementChild).toBe(count);
});
