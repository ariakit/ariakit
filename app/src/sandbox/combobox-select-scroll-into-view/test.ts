import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// The selected item only claims the active state while the user has not moved
// yet, so a registration that lands afterwards must not steal it back. The
// scroll side of this invariant is browser-only and lives in test-browser.ts.
// https://github.com/ariakit/ariakit/pull/6832
test("keeps the keyboard position when the selection registers late", async () => {
  const select = q.combobox("Late items");
  await click(select);

  // The absence is asserted after the move so it also proves the move won the
  // race against the fixture's late registration.
  await press.ArrowDown();
  expect(q.option("Item 24")).not.toBeInTheDocument();
  expect(q.option("Item 1")).toHaveAttribute("data-active-item");

  await expect
    .poll(q.option.lazy("Item 24"), { timeout: 2_000 })
    .toBeInTheDocument();

  expect(q.option("Item 1")).toHaveAttribute("data-active-item");
  expect(q.option("Item 24")).not.toHaveAttribute("data-active-item");
});
