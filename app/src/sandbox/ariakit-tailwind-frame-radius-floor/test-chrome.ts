import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getNestedRadius(card: Locator) {
  const nested = card.locator(".ak-frame");
  await expect(nested).toBeVisible();
  return nested.evaluate((element) => getComputedStyle(element).borderRadius);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("scales the minimum nested radius with the font size", async ({ q }) => {
    // The minimum radius is 0.125em of the nested frame's own font size.
    expect(await getNestedRadius(q.region("Card with 16px text"))).toBe("2px");
    expect(await getNestedRadius(q.region("Card with 8px text"))).toBe("1px");
  });
});
