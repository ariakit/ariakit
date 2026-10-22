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

test("Next.js preview cards show the loading state while their frame reloads", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/examples/tab-nextjs/");
  const card = query(q.region("Tab with Next.js App Router"));
  const iframe = page.locator('iframe[title="Tab with Next.js App Router"]');
  await iframe.scrollIntoViewIfNeeded();
  const viewport = iframe.locator("xpath=..");
  await expect(viewport).toHaveAttribute("aria-busy", "false");
  const frame = await iframe
    .elementHandle()
    .then((element) => element?.contentFrame());

  // Holding the scripts and fonts of the reloaded page delays its load event,
  // so the page stays in the state that its embed script reports while it
  // parses. Stylesheets would also hold the embed script itself.
  const { promise: released, resolve: release } = Promise.withResolvers();
  await page.route("**/*", async (route) => {
    const request = route.request();
    const type = request.resourceType();
    if (request.frame() === frame && (type === "script" || type === "font")) {
      await released;
    }
    await route.continue();
  });
  await card.button("Reload").click();
  await expect(viewport).toHaveAttribute("aria-busy", "true");

  release(undefined);
  await expect(viewport).toHaveAttribute("aria-busy", "false");
});

// Only browser chrome queries the width of its bar, so the address keeps the
// room of the code label in a narrow card.
test("Next.js preview cards hide the code label in narrow browser chrome", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/examples/tab-nextjs/");
  const card = query(q.region("Tab with Next.js App Router"));
  const label = query(card.button("Get code")).text("Get code");
  const getLabelWidth = async () => (await label.boundingBox())?.width;
  await expect.poll(getLabelWidth).toBeGreaterThan(1);
  // A phone viewport makes the bar narrower than the 32rem query.
  await page.setViewportSize({ width: 480, height: 800 });
  await expect.poll(getLabelWidth).toBeLessThanOrEqual(1);
});
