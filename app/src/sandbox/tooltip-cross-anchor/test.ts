import { hover, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/8089
test("moves a shared tooltip to the next anchor while it is active", async () => {
  await hover(q.button("Shared first anchor"));
  expect(await q.tooltip.wait("Shared first tooltip")).toBeVisible();

  await hover(q.button("Shared second anchor"));
  await expect
    .poll(q.tooltip.maybe.lazy("Shared second tooltip"))
    .toBeVisible();
});
