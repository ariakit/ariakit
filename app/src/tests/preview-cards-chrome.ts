import { query } from "@ariakit/test/playwright";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

// Frames without the Navigation API, such as WebKit frames, keep their own
// entries. Removing the API in Chrome frames runs the same code while Chrome
// still adds real frame history entries, so native traversals reach the frame.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.self === window.top) return;
    Object.defineProperty(window, "navigation", { value: undefined });
  });
});

async function gotoNextjsCard(page: Page) {
  await gotoAndSettle(page, "/react/recipes/tab-nextjs/");
  const iframe = page.locator('iframe[title="Tab with Next.js App Router"]');
  await iframe.scrollIntoViewIfNeeded();
  return iframe.contentFrame();
}

test("Next.js preview cards stay in sync after the browser moves their frame", async ({
  page,
  q,
}) => {
  const frame = await gotoNextjsCard(page);
  const preview = query(frame);
  const card = query(q.region("Tab with Next.js App Router"));
  const address = card.textbox("Address");

  await preview.tab("New").click();
  await expect(address).toHaveValue("/tab-nextjs/new");
  await expect(card.button("Back")).toBeEnabled();

  // This is the traversal of the browser back button, which page.goBack()
  // cannot run because it waits for the top-level page to navigate.
  await frame.locator("body").evaluate(() => history.back());
  await expect(address).toHaveValue("/tab-nextjs");
  await expect(preview.tabpanel("Hot")).toBeVisible();
  await expect(card.button("Back")).toBeDisabled();
  await expect(card.button("Forward")).toBeDisabled();
  await expect(page).toHaveURL(/\/react\/recipes\/tab-nextjs\/$/);
});

test("Next.js preview cards keep their history after fragment links", async ({
  page,
  q,
}) => {
  const frame = await gotoNextjsCard(page);
  const preview = query(frame);
  const card = query(q.region("Tab with Next.js App Router"));
  const address = card.textbox("Address");

  await preview.tab("New").click();
  await expect(address).toHaveValue("/tab-nextjs/new");

  // The example has no fragment links, which fire popstate like a traversal.
  await frame.locator("body").evaluate((body) => {
    const link = document.createElement("a");
    link.href = "#posts";
    link.textContent = "Skip to posts";
    body.prepend(link);
  });
  await preview.link("Skip to posts").click();
  await expect(address).toHaveValue("/tab-nextjs/new#posts");
  await expect(card.button("Back")).toBeEnabled();

  await card.button("Back").click();
  await expect(address).toHaveValue("/tab-nextjs");
  await expect(preview.tabpanel("Hot")).toBeVisible();
  await expect(page).toHaveURL(/\/react\/recipes\/tab-nextjs\/$/);
});
