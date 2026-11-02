import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names each step by its text", () => {
  const trail = q.within(q.navigation("Breadcrumb"));
  expect(trail.link("Northwind")).toBeInTheDocument();
  expect(trail.link("Field photos")).toBeInTheDocument();
  const current = trail.text("Harbor at dawn").closest("[aria-current]");
  expect(current).toHaveAttribute("aria-current", "page");
});
