import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// The autoFocusOnHide callback must not run while a dialog that mounts
// already open is still mounting. React StrictMode simulates an unmount right
// after the initial mount, which used to trigger a spurious focus restoration
// at that point. StrictMode's simulated unmount is a development-only
// behavior and CI browser tests run production builds, so this test has no
// browser duplicate.
test("does not restore focus while mounting an initially open dialog", async () => {
  expect(q.dialog()).toBeVisible();
  expect(q.status()).toHaveTextContent("Focus restores: 0");

  await click(q.button("Close"));
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.status()).toHaveTextContent("Focus restores: 1");
  expect(q.button("Final focus")).toHaveFocus();
});
