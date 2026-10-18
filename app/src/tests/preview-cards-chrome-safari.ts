import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

// Chrome moves through the frame history with the Navigation API. WebKit adds
// no history entries for frames, so the frame keeps its own entries.
test("Next.js preview cards follow routes in their browser chrome", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/examples/tab-nextjs/");
  const card = query(q.region("Tab with Next.js App Router"));
  const address = card.textbox("Address");
  const iframe = page.locator('iframe[title="Tab with Next.js App Router"]');
  await iframe.scrollIntoViewIfNeeded();
  const preview = query(iframe.contentFrame());

  await expect(address).toHaveValue("/tab-nextjs");
  await expect(card.button("Back")).toBeDisabled();
  await expect(card.button("Forward")).toBeDisabled();

  await preview.tab("New").click();
  await expect(address).toHaveValue("/tab-nextjs/new");
  await expect(card.link("Open preview in a new tab")).toHaveAttribute(
    "href",
    /\/tab-nextjs\/new$/,
  );

  await card.button("Back").click();
  await expect(address).toHaveValue("/tab-nextjs");
  await expect(preview.tabpanel("Hot")).toBeVisible();
  await expect(card.button("Back")).toBeDisabled();

  await card.button("Forward").click();
  await expect(address).toHaveValue("/tab-nextjs/new");
  await expect(preview.tabpanel("New")).toBeVisible();
  await expect(card.button("Forward")).toBeDisabled();
  // The frame history stays inside the frame.
  await expect(page).toHaveURL(/\/react\/examples\/tab-nextjs\/$/);
});

// Firefox already applies the color scheme of the docs page to its frames, so
// it cannot show whether the card sends the theme.
test("Next.js preview cards apply the site theme to their frames", async ({
  page,
  baseURL,
}) => {
  // The site stores the Theme panel choice on its own origin, which the Next.js
  // preview cannot read.
  await page.addInitScript(
    (origin) => {
      if (location.origin !== origin) return;
      localStorage.setItem("app-theme:mode", "dark");
    },
    new URL(baseURL ?? "").origin,
  );
  await gotoAndSettle(page, "/react/examples/tab-nextjs/");
  const iframe = page.locator('iframe[title="Tab with Next.js App Router"]');
  await iframe.scrollIntoViewIfNeeded();
  await expect(iframe.locator("xpath=..")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  const getPageColor = () =>
    page
      .locator("body")
      .evaluate((body) => getComputedStyle(body).backgroundColor);
  const getCanvasColor = () =>
    iframe
      .contentFrame()
      .locator("body")
      .evaluate((body) => getComputedStyle(body).backgroundColor);
  await expect.poll(getCanvasColor).toBe(await getPageColor());
});
