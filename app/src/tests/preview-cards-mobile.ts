import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

test("preview cards hide the resize handle on touch screens", async ({
  page,
  q,
}) => {
  // The landscape width gives the card room to resize.
  const { height, width } = page.viewportSize()!;
  await page.setViewportSize({ width: height, height: width });
  await gotoAndSettle(page, "/react/recipes/skeleton/");
  const card = q.region("Animations", { exact: true });
  await card.scrollIntoViewIfNeeded();
  // The card hydrates when it scrolls into view, and then measures the width
  // that the handle can resize to.
  const handle = query(card).separator("Resize preview", {
    includeHidden: true,
  });
  await handle.and(page.locator("[data-enabled]")).waitFor({
    state: "attached",
  });
  await expect(handle).toBeHidden();
});
