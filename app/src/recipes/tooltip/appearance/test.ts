import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

const tooltips = [
  "Download the PDF",
  "Open a preview",
  "Available on the Pro plan",
  "Share with your team",
  "Add to favorites",
];

test("shows a tooltip for each button on keyboard focus", async () => {
  for (const text of tooltips) {
    await press.Tab();
    expect(await q.tooltip.wait(text)).toBeVisible();
  }
});
