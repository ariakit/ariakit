import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names each field with its label", () => {
  expect(q.textbox("Coupon")).toHaveAttribute("placeholder", "SPRING-25");
  expect(q.textbox("Filter")).toHaveAttribute("placeholder", "Type to filter");
  expect(q.textbox("Quantity")).toHaveValue("12");
  expect(q.textbox("Company")).toHaveAttribute(
    "placeholder",
    "Analytical Engines Ltd.",
  );
  expect(q.textbox("Title")).toHaveValue("Notes on the Analytical Engine");
});
