import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// The simulated request takes 1.5 seconds.
const timeout = 3000;

test("shows the ancestors after the request, and again after a reload", async () => {
  expect(q.navigation("Breadcrumb")).toHaveAttribute("aria-busy", "true");
  expect(q.link.maybe("Northwind")).not.toBeInTheDocument();
  expect(q.text("Latency by region")).toHaveAttribute("aria-current", "page");
  await expect
    .poll(() => q.link.maybe("Northwind"), { timeout })
    .toBeInTheDocument();
  expect(q.navigation("Breadcrumb")).toHaveAttribute("aria-busy", "false");
  await click(q.button("Reload"));
  expect(q.link.maybe("Northwind")).not.toBeInTheDocument();
  await expect
    .poll(() => q.link.maybe("Northwind"), { timeout })
    .toBeInTheDocument();
});
