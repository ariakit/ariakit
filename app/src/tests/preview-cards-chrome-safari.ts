import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";
import {
  waitForFrameHydration,
  waitForShownFrame,
  widenExample,
} from "./preview-cards-helpers.ts";

// Chrome moves through the frame history with the Navigation API. WebKit adds
// no history entries for frames, so the frame keeps its own entries.
test("Next.js preview cards follow routes in their browser chrome", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/recipes/tabs/");
  const card = query(q.region("Tabs with the Next.js App Router"));
  const address = card.textbox("Address");
  const iframe = page.locator(
    'iframe[title="Tabs with the Next.js App Router"]',
  );
  await iframe.scrollIntoViewIfNeeded();
  // A click on a tab link before Next.js hydrates the tabs loads a new
  // document, which starts a new frame history in WebKit. The card shows the
  // frame after its load event, which in practice comes after hydration.
  // https://github.com/ariakit/ariakit/issues/8330
  await waitForShownFrame(page, "Tabs with the Next.js App Router");
  const preview = query(iframe.contentFrame());

  await expect(address).toHaveValue("/tabs/nextjs");
  await expect(card.button("Back")).toBeDisabled();
  await expect(card.button("Forward")).toBeDisabled();

  await preview.tab("Sent").click();
  await expect(address).toHaveValue("/tabs/nextjs/sent");
  await expect(card.link("Open preview in a new tab")).toHaveAttribute(
    "href",
    /\/tabs\/nextjs\/sent$/,
  );

  await card.button("Back").click();
  await expect(address).toHaveValue("/tabs/nextjs");
  await expect(preview.tabpanel("Inbox")).toBeVisible();
  await expect(card.button("Back")).toBeDisabled();

  await card.button("Forward").click();
  await expect(address).toHaveValue("/tabs/nextjs/sent");
  await expect(preview.tabpanel("Sent")).toBeVisible();
  await expect(card.button("Forward")).toBeDisabled();
  // The frame history stays inside the frame.
  await expect(page).toHaveURL(/\/react\/recipes\/tabs\/$/);
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
  await gotoAndSettle(page, "/react/recipes/tabs/");
  const iframe = page.locator(
    'iframe[title="Tabs with the Next.js App Router"]',
  );
  await iframe.scrollIntoViewIfNeeded();
  await waitForShownFrame(page, "Tabs with the Next.js App Router");
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
  await gotoAndSettle(page, "/react/recipes/tabs/");
  const card = query(q.region("Tabs with the Next.js App Router"));
  const iframe = page.locator(
    'iframe[title="Tabs with the Next.js App Router"]',
  );
  await iframe.scrollIntoViewIfNeeded();
  const viewport = iframe.locator("xpath=..");
  await waitForShownFrame(page, "Tabs with the Next.js App Router");
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
  await waitForShownFrame(page, "Tabs with the Next.js App Router");
});

// Only browser chrome follows the width of its bar, so the address keeps the
// room of the code label in a narrow card.
test("Next.js preview cards hide the code label in narrow browser chrome", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/recipes/tabs/");
  const card = query(q.region("Tabs with the Next.js App Router"));
  const label = query(card.button("Get code")).text("Get code");
  const getLabelWidth = async () => (await label.boundingBox())?.width;
  await expect.poll(getLabelWidth).toBeGreaterThan(1);
  // A phone viewport makes the bar narrower than 32rem.
  await page.setViewportSize({ width: 480, height: 800 });
  await expect.poll(getLabelWidth).toBeLessThanOrEqual(1);
  // The bar widens again, so the label shows again.
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect.poll(getLabelWidth).toBeGreaterThan(1);
});

// In Firefox on CI, the other frame didn't take focus from the card when the
// test clicked into it, so the test runs in Chrome and Safari only.
test("preview card frames take focus from another frame after a horizontal scroll", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/recipes/combobox-group/");
  const card = q
    .region("Combobox Group", { exact: true })
    .locator("[data-preview-card]");
  const iframe = page.locator('iframe[title="Combobox Group"]');
  const frame = await waitForFrameHydration(iframe);
  await waitForShownFrame(page, "Combobox Group");
  const html = frame.locator("html");
  const otherIframe = page.locator('iframe[title="Custom Items"]');
  const otherFrame = await waitForFrameHydration(otherIframe);
  await waitForShownFrame(page, "Custom Items");
  await widenExample(frame.locator("body"));
  await expect
    .poll(() => html.evaluate((el) => el.scrollWidth > el.clientWidth))
    .toBe(true);

  // The person works in the other frame first.
  const otherCombobox = query(otherFrame).combobox("Find records");
  await otherCombobox.click();
  await expect(otherCombobox).toBeFocused();
  await iframe.scrollIntoViewIfNeeded();
  const box = await iframe.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(200, 0);
  // The card takes focus, as a click on it does, so going back to the other
  // frame moves focus in the docs page and makes this frame inactive again.
  await expect(card).toBeFocused();
  await expect(html).toHaveAttribute("data-preview-active", "");
  await otherIframe.click({ position: { x: 8, y: 8 } });
  await expect(html).not.toHaveAttribute("data-preview-active", "");
});
