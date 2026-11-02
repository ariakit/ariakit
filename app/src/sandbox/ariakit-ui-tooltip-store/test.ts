import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("shows a store's open tooltip when its text arrives", async () => {
  expect(q.tooltip.maybe()).not.toBeInTheDocument();
  await click(q.button("Save"));
  expect(await q.tooltip.wait("Saved a minute ago")).toBeVisible();
});

test.each(["No text", "With text"])(
  "opens the dialog of a disclosure anchor: %s",
  async (name) => {
    await click(q.button(name));
    expect(await q.dialog.wait(`${name} dialog`)).toBeVisible();
  },
);
