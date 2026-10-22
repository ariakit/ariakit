import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the editor screen and the fill field", () => {
  // The document title starts the heading outline above the mock page.
  expect(q.heading("Spring Sale Landing Page")?.tagName).toBe("H1");
  expect(q.textbox("Fill")).toHaveValue("#111827");
});
