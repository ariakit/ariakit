import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("links each folder and marks the file", () => {
  const trail = q.within(q.navigation("File path"));
  expect(trail.link("src")).toHaveAttribute("href", "#src");
  expect(trail.link("components")).toHaveAttribute("href", "#components");
  expect(trail.link("ui")).toHaveAttribute("href", "#ui");
  expect(trail.text("breadcrumb.tsx")).toHaveAttribute("aria-current", "page");
});
