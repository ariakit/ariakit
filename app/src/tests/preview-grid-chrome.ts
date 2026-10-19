import { query } from "@ariakit/test/playwright";
import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

// Only Chrome supports the calc-size() rule that lines up the cards. Other
// browsers keep the card heights, which preview-cards-browser.ts covers.
test("preview grid cards of similar heights line up", async ({ page, q }) => {
  await page.setViewportSize({ width: 1440, height: 1400 });
  await gotoAndSettle(page, "/react/examples/skeleton/");
  // An example can name its own region like its card, and the card region comes
  // first.
  const getCard = (title: string) =>
    q.region(title, { exact: true }).first().locator(":scope > *");
  const getHeight = (locator: Locator) =>
    locator.evaluate((element) => element.getBoundingClientRect().height);
  const settings = q.region("Settings Form", { exact: true });
  const article = q.region("Article", { exact: true });
  await expect(query(settings).status()).toHaveText("Account loaded");
  await expect(query(article).status()).toHaveText("Article loaded");

  // The settings card is a little shorter than the feed card, so it grows to
  // the row. The thumbnails card is much shorter than the article card, so it
  // keeps its height.
  await expect
    .poll(
      async () =>
        (await getHeight(getCard("Settings Form"))) -
        (await getHeight(getCard("Feed"))),
    )
    .toBeCloseTo(0, 0);
  expect(await getHeight(getCard("Thumbnails"))).toBeLessThan(
    (await getHeight(getCard("Article"))) * 0.8,
  );
});
