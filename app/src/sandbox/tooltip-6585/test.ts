import { click, hover, q } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/issues/6585
// This regression reproduces in React 18 development StrictMode.
test("does not leak duplicate tooltip portal containers in StrictMode", async () => {
  expect(q.status("Portal containers")).toHaveTextContent(
    "Portal containers: 0",
  );

  await hover(q.button.ensure("Hover target"));
  expect(q.tooltip("Tooltip content")).toBeVisible();
  expect(q.status("Portal containers")).toHaveTextContent(
    "Portal containers: 1",
  );

  await click(q.button("Unmount tooltip"));
  expect(q.tooltip("Tooltip content")).not.toBeInTheDocument();
  expect(q.status("Portal containers")).toHaveTextContent(
    "Portal containers: 0",
  );
});
