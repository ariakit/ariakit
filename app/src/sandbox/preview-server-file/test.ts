import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("renders the code that the server file highlights", () => {
  const file = q.figure("counter.ts");
  expect(file).toHaveTextContent("return count + 1;");
  // Each token has a color for the light and the dark color scheme.
  expect(file.querySelector(".line [style*='--shiki-dark']")).toBeVisible();
  expect(q.button("Load counter.css")).toBeVisible();
});
