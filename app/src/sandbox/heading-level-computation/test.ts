import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("standalone Heading defaults to native h1 without aria-level", () => {
  const heading = q.heading("Standalone heading", { level: 1 });
  expect(heading).toHaveProperty("tagName", "H1");
  expect(heading).not.toHaveAttribute("aria-level");
});

test("Heading rendered as div falls back to role and aria-level", () => {
  const heading = q.heading("Rendered heading", { level: 3 });
  expect(heading).toHaveProperty("tagName", "DIV");
  expect(heading).toHaveAttribute("role", "heading");
  expect(heading).toHaveAttribute("aria-level", "3");
});

test("nested HeadingLevel clamps computed levels to h6", () => {
  const heading = q.heading("Clamped heading", { level: 6 });
  expect(heading).toHaveProperty("tagName", "H6");
  expect(heading).not.toHaveAttribute("aria-level");
});

test("sibling headings share their parent level", () => {
  expect(q.heading("First section", { level: 2 })).toHaveProperty(
    "tagName",
    "H2",
  );
  expect(q.heading("Second section", { level: 2 })).toHaveProperty(
    "tagName",
    "H2",
  );
  expect(q.text("First section content")).toBeInTheDocument();
  expect(q.text("Second section content")).toBeInTheDocument();
});
