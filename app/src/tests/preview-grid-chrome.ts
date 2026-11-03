import { query } from "@ariakit/test/playwright";
import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

// Only Chrome supports the calc-size() rule that lines up the cards. Other
// browsers keep the card heights, which preview-cards-browser.ts covers.
test("preview grid cards of similar heights line up", async ({ page, q }) => {
  await page.setViewportSize({ width: 1440, height: 1400 });
  await gotoAndSettle(page, "/react/recipes/skeleton/");
  // An example can name its own region like its card, and the card region comes
  // first.
  const getCard = (title: string) =>
    q.region(title, { exact: true }).first().locator(":scope > *");
  const getHeight = (locator: Locator) =>
    locator.evaluate((element) => element.getBoundingClientRect().height);
  const timing = q.region("Timing", { exact: true });
  const article = q.region("Paragraph Lines", { exact: true });
  // Cards hydrate when they scroll into view. Each of these cards shares its
  // row with a card that the test measures too.
  await timing.scrollIntoViewIfNeeded();
  await expect(query(timing).status()).toHaveText("Contact loaded");
  await expect(
    query(getCard("Skeleton")).status().filter({ hasText: "Profile loaded" }),
  ).toBeVisible();
  await article.scrollIntoViewIfNeeded();
  await expect(query(article).status()).toHaveText("Article loaded");

  // The timing card is a little shorter than the skeleton card, so it grows to
  // the row. The thumbnails card is much shorter than the article card, so it
  // keeps its height.
  await expect
    .poll(
      async () =>
        (await getHeight(getCard("Timing"))) -
        (await getHeight(getCard("Skeleton"))),
    )
    .toBeCloseTo(0, 0);
  expect(await getHeight(getCard("Static Shapes"))).toBeLessThan(
    (await getHeight(getCard("Paragraph Lines"))) * 0.8,
  );
});

test("a preview grid browser card fills one column at its minimum height", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1440, height: 1400 });
  await gotoAndSettle(page, "/react/recipes/tabs/");
  const getBox = (locator: Locator) =>
    locator.evaluate((element) => {
      const { top, width, height } = element.getBoundingClientRect();
      return { top, width, height };
    });
  const nextjs = q.region("Tabs with the Next.js App Router", { exact: true });
  const router = q.region("Tabs with React Router", { exact: true });
  await nextjs.scrollIntoViewIfNeeded();
  const nextjsBox = await getBox(nextjs);
  const routerBox = await getBox(router);
  expect(nextjsBox.width).toBeCloseTo(routerBox.width, 0);
  expect(nextjsBox.top).toBeCloseTo(routerBox.top, 0);
  // The example asks for 18rem in its preview.json, which differs from the
  // 16rem minimum of the grid.
  const iframe = page.locator(
    'iframe[title="Tabs with the Next.js App Router"]',
  );
  expect((await getBox(iframe)).height).toBeCloseTo(18 * 16, 0);
});

test("a preview grid card that would sit alone takes the whole row", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1440, height: 1400 });
  await gotoAndSettle(page, "/react/recipes/navigation/");
  const getRegion = (title: string) => q.region(title, { exact: true }).first();
  const getBox = (title: string) =>
    getRegion(title).evaluate((element) => {
      const { left, top, width } = element.getBoundingClientRect();
      return { left, top, width };
    });
  // The gallery pairs every half-width card, so removing the second card of the
  // first pair leaves Navigation alone before the full-width Top Bar.
  await getRegion("Custom Current Link").evaluate((element) =>
    element.remove(),
  );
  const [navigation, topBar, course, workspace] = await Promise.all([
    getBox("Navigation"),
    getBox("Top Bar"),
    getBox("Progress Tracking"),
    getBox("Shortcut Hints"),
  ]);
  expect(navigation.left).toBeCloseTo(topBar.left, 0);
  expect(navigation.width).toBeCloseTo(topBar.width, 0);
  // The next pair still shares a row.
  expect(workspace.top).toBeCloseTo(course.top, 0);
  expect(workspace.left).toBeGreaterThan(course.left + course.width);
});
