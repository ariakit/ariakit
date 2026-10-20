import { query } from "@ariakit/test/playwright";
import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { flushFrames, gotoAndSettle } from "#app/test-utils/preview.ts";

test("combobox preview cards work in their iframes", async ({ page, q }) => {
  await gotoAndSettle(page, "/react/examples/combobox-group/");

  for (const title of ["Combobox Group", "Custom Items"]) {
    const iframe = page.locator(`iframe[title="${title}"]`);
    await iframe.scrollIntoViewIfNeeded();
    const frame = iframe.contentFrame();
    await expect(frame.locator("html")).toHaveAttribute(
      "data-preview-hydrated",
      "",
    );
    const preview = query(frame);
    await preview.combobox("Find records").fill("annual");
    await expect(preview.option(/annual_report\.pdf/)).toBeVisible();
    await expect(preview.group("Files")).toBeVisible();
    if (title === "Custom Items") {
      await expect(preview.option(/annual_report\.pdf/)).toContainText(
        "Documents",
      );
    }
    await preview.option(/annual_report\.pdf/).click();
    await expect(preview.combobox("Find records")).toHaveValue(
      "annual_report.pdf",
    );
    await expect(preview.listbox()).not.toBeVisible();
    await preview.combobox("Find records").fill("No matching record");
    await expect(preview.text("No results found")).toBeVisible();
    await expect(preview.option()).toHaveCount(0);
  }

  const card = query(q.region("Combobox Group"));
  const getCode = card.button("Get code");
  await getCode.click();
  await expect(getCode).toHaveAttribute("aria-expanded", "true");
  await expect(q.region("Combobox Group code")).toContainText(
    "export default function Example",
  );
});

test("preview card frames do not scroll or take focus until activated", async ({
  page,
}) => {
  await gotoAndSettle(page, "/react/examples/combobox-group/");
  const iframe = page.locator('iframe[title="Combobox Group"]');
  await iframe.scrollIntoViewIfNeeded();
  const frame = iframe.contentFrame();
  await expect(frame.locator("html")).toHaveAttribute(
    "data-preview-hydrated",
    "",
  );
  const combobox = query(frame).combobox("Find records");
  const getPageScroll = () => page.evaluate(() => window.scrollY);
  const getFrameScroll = () =>
    frame.locator("html").evaluate((html) => html.scrollTop);

  // Some components move focus on hover. The inactive frame ignores these calls
  // so the docs page keeps focus.
  await combobox.evaluate((element) => element.focus());
  await expect(combobox).not.toBeFocused();

  const box = await iframe.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const pageScroll = await getPageScroll();
  await page.mouse.wheel(0, 200);
  await expect.poll(getPageScroll).toBeGreaterThan(pageScroll);
  expect(await getFrameScroll()).toBe(0);

  // A click inside the frame activates it.
  await frame.locator("body").click({ position: { x: 8, y: 8 } });
  await combobox.evaluate((element) => element.focus());
  await expect(combobox).toBeFocused();
  // WebKit applies the new root overflow to wheel scrolling on a later
  // rendering update, which no page state reports.
  await flushFrames(page);
  await page.mouse.wheel(0, 200);
  await expect.poll(getFrameScroll).toBeGreaterThan(0);
});

test("preview cards resize their viewport from the end edge", async ({
  page,
  q,
}) => {
  // The card starts wider than the shell breakpoint that folds the sidebar.
  await page.setViewportSize({ width: 1600, height: 900 });
  await gotoAndSettle(page, "/react/examples/app-shell/");
  const iframe = page.locator('iframe[title="App Shell"]');
  await iframe.scrollIntoViewIfNeeded();
  const frame = iframe.contentFrame();
  await expect(frame.locator("html")).toHaveAttribute(
    "data-preview-hydrated",
    "",
  );
  const preview = query(frame);
  const handle = query(q.region("App Shell", { exact: true })).separator(
    "Resize preview",
  );
  await expect(preview.navigation("Guides")).toBeVisible();
  const fullWidth = (await handle.getAttribute("aria-valuemax")) ?? "";
  await expect(handle).toHaveAttribute("aria-valuenow", fullWidth);

  const box = await handle.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  const y = box.y + box.height / 2;
  const startX = box.x + box.width / 2;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  // The drag moves over the frame, which must not take the pointer.
  await page.mouse.move(startX - (Number(fullWidth) - 480), y, { steps: 8 });
  await page.mouse.up();
  await expect(handle).toHaveAttribute("aria-valuenow", "480");
  await expect(preview.navigation("Guides")).not.toBeVisible();

  await handle.press("End");
  await expect(handle).toHaveAttribute("aria-valuenow", fullWidth);
  await expect(preview.navigation("Guides")).toBeVisible();
  await handle.press("Home");
  await expect(handle).toHaveAttribute("aria-valuenow", "320");
  await handle.press("Shift+ArrowRight");
  await expect(handle).toHaveAttribute("aria-valuenow", "480");
  await handle.press("ArrowLeft");
  await expect(handle).toHaveAttribute("aria-valuenow", "464");
  await handle.dblclick();
  await expect(handle).toHaveAttribute("aria-valuenow", fullWidth);
});

for (const width of [1600, 700]) {
  test(`preview grid cards that share a row hide the resize handle at ${width}px`, async ({
    page,
    q,
  }) => {
    // At 700px, the grid stacks every card, including the ones that share a row
    // on wider screens.
    await page.setViewportSize({ width, height: 900 });
    await gotoAndSettle(page, "/react/examples/skeleton/");
    for (const [title, shown] of [
      ["Animations", true],
      ["Timing", false],
    ] as const) {
      const card = q.region(title, { exact: true });
      // The card renders the handle only after it hydrates. On a slow runner,
      // the cards on this page can take longer than the assertion timeout to
      // hydrate, so the wait uses the test budget, like the preview hydration
      // wait in withFramework.
      // https://github.com/ariakit/ariakit/issues/8001
      const handle = query(card).separator("Resize preview", {
        includeHidden: true,
      });
      await handle.waitFor({ state: "attached" });
      await expect(handle).toBeVisible({ visible: shown });
    }
  });
}

test("preview grid cards keep their heights and stick within their row", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await gotoAndSettle(page, "/react/examples/skeleton/");
  // Each card region stretches to its grid row, and the card inside it keeps
  // its own height. An example can name its own region like its card, and the
  // card region comes first.
  const getRow = (title: string) => q.region(title, { exact: true }).first();
  const getCard = (title: string) => getRow(title).locator(":scope > *");
  const getRect = (locator: Locator) =>
    locator.evaluate((element) => {
      const { top, bottom, width, height } = element.getBoundingClientRect();
      return { top, bottom, width, height };
    });
  const article = q.region("Article", { exact: true });
  await expect(query(article).status()).toHaveText("Article loaded");

  const articleCard = await getRect(getCard("Article"));
  const thumbnailsCard = await getRect(getCard("Thumbnails"));
  expect(thumbnailsCard.height).toBeLessThan(articleCard.height);
  // The article card fits on the screen, so its example scrolls instead.
  expect(articleCard.height).toBeLessThanOrEqual(700);
  // A card that takes the whole row fills its width.
  const fullRow = await getRect(getRow("Animations"));
  const fullRowCard = await getRect(getCard("Animations"));
  expect(fullRowCard.width).toBeCloseTo(fullRow.width, 0);

  // In the middle of the row, the shorter card stays below the sticky headers
  // while the taller card scrolls past.
  await article.evaluate((element) => element.scrollIntoView());
  await page.evaluate(() => window.scrollBy(0, 200));
  await expect
    .poll(async () => {
      const thumbnails = await getRect(getCard("Thumbnails"));
      const article = await getRect(getCard("Article"));
      return thumbnails.top - article.top;
    })
    .toBeGreaterThan(100);

  // Once the next row comes up, the cards of the previous row leave with their
  // row instead of sticking over the next one.
  const nextRow = getRow("Data Table");
  await nextRow.evaluate((element) => {
    const { top } = element.getBoundingClientRect();
    window.scrollBy(0, top - 300);
  });
  await expect.poll(async () => (await getRect(nextRow)).top).toBeLessThan(350);
  const nextRowTop = (await getRect(nextRow)).top;
  for (const title of ["Feed", "Settings Form"]) {
    expect((await getRect(getCard(title))).bottom).toBeLessThanOrEqual(
      nextRowTop,
    );
  }
});

test("inline previews scroll only after focus moves into them", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await gotoAndSettle(page, "/react/examples/skeleton/");
  const article = q.region("Article", { exact: true });
  await expect(query(article).status()).toHaveText("Article loaded");
  // The handle names the viewport it resizes.
  const handle = query(article).separator("Resize preview", {
    includeHidden: true,
  });
  const viewportId = await handle.getAttribute("aria-controls");
  const viewport = page.locator(`[id="${viewportId}"]`);
  const getViewportScroll = () =>
    viewport.evaluate((element) => element.scrollTop);
  const getPageScroll = () => page.evaluate(() => window.scrollY);
  await expect
    .poll(() => viewport.evaluate((el) => el.scrollHeight > el.clientHeight))
    .toBe(true);

  await viewport.evaluate((element) => element.scrollIntoView());
  const box = await viewport.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.move(box.x + 24, box.y + 120);
  const pageScroll = await getPageScroll();
  await page.mouse.wheel(0, 100);
  await expect.poll(getPageScroll).toBeGreaterThan(pageScroll);
  expect(await getViewportScroll()).toBe(0);

  // A click in the example moves focus into it, so the next wheel scrolls it.
  const activeBox = await viewport.boundingBox();
  expect(activeBox).not.toBeNull();
  if (!activeBox) return;
  await page.mouse.click(activeBox.x + 24, activeBox.y + 120);
  await expect(viewport).toBeFocused();
  await page.mouse.wheel(0, 100);
  await expect.poll(getViewportScroll).toBeGreaterThan(0);
});

test("inline previews stay active when focus falls back to the page", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await gotoAndSettle(page, "/react/examples/skeleton/");
  // The feed example names its own region like its card, and the card region
  // comes first.
  const card = query(q.region("Feed", { exact: true }).first());
  const handle = card.separator("Resize preview", { includeHidden: true });
  const viewportId = await handle.getAttribute("aria-controls");
  const viewport = page.locator(`[id="${viewportId}"]`);
  const getViewportScroll = () =>
    viewport.evaluate((element) => element.scrollTop);
  await viewport.evaluate((element) => element.scrollIntoView());
  const loadMore = card.button("Load more");
  await expect(loadMore).toBeEnabled();
  // The button turns disabled while the posts load, so the browser moves focus
  // from it to the page.
  await loadMore.click();
  await expect(loadMore).toBeDisabled();
  await expect(loadMore).not.toBeFocused();
  // The click can scroll the button into view within the card.
  const viewportScroll = await getViewportScroll();
  await page.mouse.wheel(0, 100);
  await expect.poll(getViewportScroll).toBeGreaterThan(viewportScroll);
});

for (const framework of ["react", "solid"]) {
  test(`${framework} separator page uses its framework preview`, async ({
    page,
    q,
  }) => {
    await gotoAndSettle(page, `/${framework}/components/separator/`);
    // The site navigation also links to the Separator page, so the preview link
    // is queried within the preview card region.
    const card = query(q.region("Separator"));
    // The card's resize handle is also a separator, so the example's separator
    // is queried within the viewport that the handle controls.
    const handle = card.separator("Resize preview");
    const viewportId = await handle.getAttribute("aria-controls");
    await expect(
      query(page.locator(`[id="${viewportId}"]`)).separator(),
    ).toBeVisible();
    await expect(card.link("Open preview in a new tab")).toHaveAttribute(
      "href",
      `/${framework}/previews/separator/_component/`,
    );
    await card.button("Get code").click();
    await expect(q.region("Separator code")).toContainText(
      `@ariakit/${framework}`,
    );
  });
}
