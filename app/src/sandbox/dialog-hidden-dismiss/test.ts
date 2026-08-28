import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Modal dialogs keep the fallback dismiss button so that screen reader users
// aren't trapped in them. Menu opts out of it because the ARIA menu pattern
// doesn't allow a `button` there, and that opt out must stay scoped to menus.
// https://github.com/ariakit/ariakit/issues/4270
test("modal dialog without a dismiss element gets a hidden one", async () => {
  await click(q.button("Terms"));
  const dialog = q.dialog("Terms");
  expect(dialog).toBeVisible();
  expect(q.within(dialog).button("Dismiss popup")).toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/4270
test("modal dialog with a dismiss element gets no hidden one", async () => {
  await click(q.button("Receipt"));
  const dialog = q.dialog("Receipt");
  expect(dialog).toBeVisible();
  expect(q.within(dialog).button.all()).toHaveLength(1);
  expect(q.within(dialog).button("Done")).toBeInTheDocument();
});
