import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

// Without JavaScript, the page keeps the server markup, and the code of a card
// can't open.
test.use({ javaScriptEnabled: false });

// The address keeps the room of the code label in narrow browser chrome.
test("Next.js preview cards hide the code label without scripts", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 480, height: 800 });
  await gotoAndSettle(page, "/react/recipes/tabs/");
  const card = query(q.region("Tabs with the Next.js App Router"));
  const label = query(card.button("Get code")).text("Get code");
  const getLabelWidth = async () => (await label.boundingBox())?.width;
  await expect.poll(getLabelWidth).toBeLessThanOrEqual(1);
});
