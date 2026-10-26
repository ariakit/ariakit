import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("describes the disabled Publish button with the reason", () => {
  const publish = q.button("Publish");
  expect(publish).toHaveAttribute("aria-disabled", "true");
  expect(publish).toHaveAccessibleDescription("Add a title to publish.");
});

test("keeps focus on the disabled button and shows the reason", async () => {
  await press.Tab();
  await press.Tab();
  expect(q.button("Publish")).toHaveFocus();
  expect(await q.tooltip.wait("Add a title to publish.")).toBeVisible();
});

test("publishes once there is a title", async () => {
  await click(q.textbox("Title"));
  await type("Launch notes");
  const publish = q.button("Publish");
  expect(publish).not.toHaveAttribute("aria-disabled");
  expect(publish).toHaveAccessibleDescription("");
  await click(publish);
  expect(q.status()).toHaveTextContent("Published “Launch notes”.");
});
