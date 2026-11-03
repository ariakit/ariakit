import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// The simulated request takes 900 milliseconds.
const timeout = 3000;

test("moves focus without loading until a tab is selected", async () => {
  await click(q.tab("Sales"));
  await press.ArrowRight();
  expect(q.tab("Traffic")).toHaveFocus();
  expect(q.tab("Sales")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Sales")).toHaveAttribute("aria-busy", "false");

  await press.Enter();
  expect(q.tabpanel("Traffic")).toHaveAttribute("aria-busy", "true");
  await expect
    .poll(() => q.tabpanel("Traffic").getAttribute("aria-busy"), { timeout })
    .toBe("false");
  expect(q.tabpanel("Traffic")).toHaveTextContent(
    "Traffic from search doubled since March.",
  );
});
