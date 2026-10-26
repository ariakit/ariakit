import { query } from "@ariakit/test/playwright";
import type { Locator, Page, Route } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { flushFrames, gotoAndSettle } from "#app/test-utils/preview.ts";

// The article example announces that it loaded 1.8 seconds after it hydrates,
// and its card hydrates when it scrolls into view. On a slow runner, the card
// can take longer than the assertion timeout to hydrate, so the wait uses the
// test budget, like the resize handle wait below.
// https://github.com/ariakit/ariakit/issues/8006
async function waitForArticle(article: Locator) {
  await article.scrollIntoViewIfNeeded();
  const status = query(article).status();
  await status.filter({ hasText: "Article loaded" }).waitFor();
}

// A preview frame loads lazily once it scrolls into view, and its example
// hydrates once its modules load. On a slow runner, the frame navigation can
// take longer than the assertion timeout, so the wait uses the test budget,
// like the preview hydration wait in withFramework.
async function waitForFrameHydration(iframe: Locator) {
  await iframe.scrollIntoViewIfNeeded();
  const frame = iframe.contentFrame();
  await frame
    .locator("html[data-preview-hydrated]")
    .waitFor({ state: "attached" });
  return frame;
}

// The card shows its frame once the page in it has loaded and settled its
// popup. After a navigation, the wait spans the docs page, the card hydration,
// and the frame navigation, which can take longer than the assertion timeout on
// a slow runner, so the wait uses the test budget, like the wait in
// getRevealedComboboxState.
async function waitForShownFrame(page: Page, title: string) {
  const iframe = page.locator(`iframe[title="${title}"]`);
  await page
    .locator(`[aria-busy="false"]:has(> iframe[title="${title}"])`)
    .waitFor({ state: "attached" });
  return iframe;
}

// The card shows the frame once the popup of its example has opened and the
// frame has scrolled to it, so the frame does not show the closed combobox and
// then jump. A retrying assertion would also pass if the popup opened after the
// card showed the frame, so this samples the combobox state and the frame
// scroll on each frame until the card shows the frame.
async function getRevealedComboboxState(page: Page) {
  const revealed = await page.waitForFunction(
    () => {
      const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe[title="Combobox Group"]',
      );
      const viewport = iframe?.parentElement;
      if (viewport?.getAttribute("aria-busy") !== "false") return null;
      const doc = iframe?.contentDocument;
      const combobox = doc?.querySelector("[role=combobox]");
      return {
        hydrated: doc?.documentElement.hasAttribute("data-preview-hydrated"),
        expanded: combobox?.getAttribute("aria-expanded"),
        scrollTop: doc?.documentElement.scrollTop,
      };
    },
    null,
    { polling: "raf" },
  );
  const state = await revealed.jsonValue();
  if (!state) throw new Error("The card did not show the frame");
  return state;
}

// Routes the modules that the islands in preview frames import to hydrate their
// examples. Returns the paths of the frames whose modules it routed, so a test
// can check that it changed the example it asserts on.
async function routeExampleModules(
  page: Page,
  handler: (route: Route) => Promise<void>,
) {
  const routedFrames: string[] = [];
  await page.route("**/*", async (route, request) => {
    if (request.resourceType() !== "script") return route.fallback();
    const frame = request.frame();
    if (frame === page.mainFrame()) return route.fallback();
    const componentUrls: (string | null)[] = await frame
      .evaluate(() => {
        const islands = document.querySelectorAll("astro-island");
        return Array.from(islands, (island) => {
          const url = island.getAttribute("component-url");
          return url ? new URL(url, location.href).pathname : null;
        });
      })
      .catch(() => []);
    const { pathname } = new URL(request.url());
    if (!componentUrls.includes(pathname)) return route.fallback();
    routedFrames.push(new URL(frame.url()).pathname);
    await handler(route);
  });
  return routedFrames;
}

test("combobox preview cards work in their iframes", async ({ page, q }) => {
  await gotoAndSettle(page, "/react/recipes/combobox-group/");

  for (const title of ["Combobox Group", "Custom Items"]) {
    const iframe = page.locator(`iframe[title="${title}"]`);
    const preview = query(await waitForFrameHydration(iframe));
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

test("preview cards reload the page in their frame", async ({ page, q }) => {
  await gotoAndSettle(page, "/react/recipes/combobox-group/");
  const iframe = page.locator('iframe[title="Combobox Group"]');
  const preview = query(await waitForFrameHydration(iframe));
  const combobox = preview.combobox("Find records");
  await combobox.fill("annual");
  await preview.option(/annual_report\.pdf/).click();
  await expect(combobox).toHaveValue("annual_report.pdf");

  const card = query(q.region("Combobox Group"));
  await card.button("Reload preview").click();
  // The locator follows the new document, which starts the example from its
  // initial state.
  await expect(combobox).toHaveValue("");
});

test("preview card frames do not scroll or take focus until activated", async ({
  page,
}) => {
  await gotoAndSettle(page, "/react/recipes/combobox-group/");
  const iframe = page.locator('iframe[title="Combobox Group"]');
  const frame = await waitForFrameHydration(iframe);
  const combobox = query(frame).combobox("Find records");
  const getPageScroll = () => page.evaluate(() => window.scrollY);
  const getFrameScroll = () =>
    frame.locator("html").evaluate((html) => html.scrollTop);
  // The frame scrolls to the popup that it opens before the card shows it.
  await expect(iframe.locator("xpath=..")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  const frameScroll = await getFrameScroll();
  // Only touch screens stop the scroll containers of an inactive frame. Here,
  // the frame passes the wheel to the card.
  await expect(query(frame).listbox()).toHaveCSS("overflow-y", "auto");

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
  expect(await getFrameScroll()).toBe(frameScroll);

  // A click inside the frame activates it.
  const frameBox = await iframe.boundingBox();
  expect(frameBox).not.toBeNull();
  if (!frameBox) return;
  await page.mouse.click(frameBox.x + 8, frameBox.y + 8);
  await combobox.evaluate((element) => element.focus());
  await expect(combobox).toBeFocused();
  // WebKit applies the new root overflow to wheel scrolling on a later
  // rendering update, which no page state reports.
  await flushFrames(page);
  await page.mouse.wheel(0, 200);
  await expect.poll(getFrameScroll).toBeGreaterThan(frameScroll);
});

test("preview card frames pass the wheel to the page over contained scroll areas", async ({
  page,
}) => {
  // The example sidebar shows at this width.
  await page.setViewportSize({ width: 1600, height: 900 });
  await gotoAndSettle(page, "/react/recipes/navigation/");
  const iframe = page.locator('iframe[title="Sidebar Sections"]');
  const frame = await waitForFrameHydration(iframe);
  const link = query(frame).link(/Combobox/);
  await expect(link).toBeVisible();
  // Contain the overscroll of the open section, as an app could, so it keeps
  // the wheel from the page even though its links fit.
  await link.evaluate((element) => {
    const section = element.closest(".disclosure-content > *");
    if (!(section instanceof HTMLElement)) throw new Error("No section");
    section.style.overscrollBehavior = "contain";
  });
  const box = await link.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const getPageScroll = () => page.evaluate(() => window.scrollY);
  const pageScroll = await getPageScroll();
  await page.mouse.wheel(0, 200);
  await expect.poll(getPageScroll).toBeGreaterThan(pageScroll);
});

test("preview card frames scroll after a resize with the handle", async ({
  page,
  q,
}) => {
  // The card is wide enough to resize.
  await page.setViewportSize({ width: 1600, height: 900 });
  await gotoAndSettle(page, "/react/recipes/combobox-group/");
  const iframe = page.locator('iframe[title="Combobox Group"]');
  await iframe.scrollIntoViewIfNeeded();
  const frame = iframe.contentFrame();
  const root = frame.locator("html");
  await expect(root).toHaveAttribute("data-preview-hydrated", "");
  // The frame scrolls to the popup that it opens before the card shows it.
  await expect(iframe.locator("xpath=..")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  const getPageScroll = () => page.evaluate(() => window.scrollY);
  const getFrameScroll = () => root.evaluate((html) => html.scrollTop);
  const handle = query(q.region("Combobox Group", { exact: true })).separator(
    "Resize preview",
  );

  const handleBox = await handle.boundingBox();
  expect(handleBox).not.toBeNull();
  if (!handleBox) return;
  const y = handleBox.y + handleBox.height / 2;
  const startX = handleBox.x + handleBox.width / 2;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(startX - 100, y, { steps: 4 });
  await page.mouse.up();
  await expect(root).toHaveAttribute("data-preview-active", "");

  const box = await iframe.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  // The corner of the frame is clear of the popup, which scrolls on its own. A
  // drag on the handle could leave Chrome sending this wheel to the docs page.
  // https://github.com/ariakit/ariakit/issues/8054
  await page.mouse.move(box.x + 8, box.y + 8);
  const frameScroll = await getFrameScroll();
  const pageScroll = await getPageScroll();
  // WebKit applies the new root overflow to wheel scrolling on a later
  // rendering update, which no page state reports.
  await flushFrames(page);
  // The frame starts scrolled down to its open popup.
  expect(frameScroll).toBeGreaterThan(0);
  await page.mouse.wheel(0, -200);
  await expect.poll(getFrameScroll).toBeLessThan(frameScroll);
  expect(await getPageScroll()).toBe(pageScroll);

  // A click on the docs page makes the frame inactive again.
  await q.heading("Combobox Group", { level: 1 }).click();
  await expect(root).not.toHaveAttribute("data-preview-active", "");

  // A key on the handle also counts as a resize.
  await handle.press("ArrowRight");
  await expect(root).toHaveAttribute("data-preview-active", "");

  // A new document in the frame stays active while focus stays on the handle,
  // such as when the example reloads itself.
  const childFrame = await (await iframe.elementHandle())?.contentFrame();
  expect(childFrame).toBeTruthy();
  if (!childFrame) return;
  const reloaded = page.waitForEvent("framenavigated", (navigated) => {
    return navigated === childFrame;
  });
  await root.evaluate(() => location.reload());
  await reloaded;
  await expect(root).toHaveAttribute("data-preview-hydrated", "");
  await expect(root).toHaveAttribute("data-preview-active", "");
  await expect(handle).toBeFocused();

  // A click in another preview frame sends no event to the docs page, but it
  // also makes the frame inactive, even after a click in the frame itself.
  const frameBox = await iframe.boundingBox();
  expect(frameBox).not.toBeNull();
  if (!frameBox) return;
  await page.mouse.click(frameBox.x + 8, frameBox.y + 8);
  await expect(root).toHaveAttribute("data-preview-active", "");
  const otherFrame = page.locator('iframe[title="Custom Items"]');
  await otherFrame.scrollIntoViewIfNeeded();
  const otherBox = await otherFrame.boundingBox();
  expect(otherBox).not.toBeNull();
  if (!otherBox) return;
  await page.mouse.click(otherBox.x + 8, otherBox.y + 8);
  await expect(root).not.toHaveAttribute("data-preview-active", "");

  // A new document in the frame stays inactive once focus is in another frame.
  const reloadedAgain = page.waitForEvent("framenavigated", (navigated) => {
    return navigated === childFrame;
  });
  await root.evaluate(() => location.reload());
  await reloadedAgain;
  // The card would replay the activation when the new document reports its
  // location while it parses, long before it hydrates.
  await expect(root).toHaveAttribute("data-preview-hydrated", "");
  await expect(root).not.toHaveAttribute("data-preview-active", "");
});

test("preview cards show the popup of their example open", async ({
  page,
  q,
}) => {
  await page.goto("/react/recipes/combobox-group/", { waitUntil: "commit" });
  const revealed = await getRevealedComboboxState(page);
  // The card waits for the example to hydrate before it shows the frame, so a
  // failure here means the card showed the frame too early, and a failure on
  // the popup state below means the example did not open it.
  expect(revealed.hydrated).toBe(true);
  expect(revealed.expanded).toBe("true");

  const iframe = page.locator('iframe[title="Combobox Group"]');
  const html = iframe.contentFrame().locator("html");
  // The frame centers the popup two frames after its first scroll, and no state
  // reports a scroll that would follow the reveal.
  await flushFrames(page);
  expect(await html.evaluate((element) => element.scrollTop)).toBe(
    revealed.scrollTop,
  );

  await iframe.scrollIntoViewIfNeeded();
  const preview = query(iframe.contentFrame());
  const combobox = preview.combobox("Find records");
  const listbox = preview.listbox();
  await expect(listbox).toBeVisible();
  // The frame stays inactive, so the popup does not take focus from the page.
  await expect(combobox).not.toBeFocused();

  // The frame scrolls so the popup opens below the combobox and its label.
  const frameBox = await iframe.boundingBox();
  const labelBox = await preview.text("Find records").boundingBox();
  const comboboxBox = await combobox.boundingBox();
  const listboxBox = await listbox.boundingBox();
  expect(frameBox).not.toBeNull();
  expect(labelBox).not.toBeNull();
  expect(comboboxBox).not.toBeNull();
  expect(listboxBox).not.toBeNull();
  if (!frameBox || !labelBox || !comboboxBox || !listboxBox) return;
  expect(labelBox.y).toBeGreaterThanOrEqual(frameBox.y);
  expect(listboxBox.y).toBeGreaterThanOrEqual(
    comboboxBox.y + comboboxBox.height,
  );

  // Interactions on the docs page do not close the popup in the frame.
  const getCode = query(q.region("Combobox Group")).button("Get code");
  await getCode.click();
  await expect(getCode).toHaveAttribute("aria-expanded", "true");
  // The popup would close in the render that follows the click, which the
  // expanded button above does not wait for. The popup stays visible while it
  // animates out, so the combobox state tells whether it closed.
  await flushFrames(page);
  expect(await combobox.getAttribute("aria-expanded")).toBe("true");

  // A click in the frame below the example is outside the popup and closes it.
  await page.mouse.click(frameBox.x + 8, frameBox.y + frameBox.height - 8);
  await expect(listbox).not.toBeVisible();
  await expect(combobox).toHaveAttribute("aria-expanded", "false");
});

test("preview cards wait for a slow example to open its popup", async ({
  page,
}) => {
  // On a slow network, the example module arrives seconds after the frame
  // requests it. Some browsers fire the load event of the frame before then, so
  // the example hydrates and opens its popup long after its frame loads.
  const routedFrames = await routeExampleModules(page, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await route.fallback();
  });
  await page.goto("/react/recipes/combobox-group/", { waitUntil: "commit" });
  const revealed = await getRevealedComboboxState(page);
  expect(routedFrames).toContain("/react/previews/combobox-group/");
  expect(revealed.expanded).toBe("true");
});

test("preview cards show an example that fails to hydrate", async ({
  page,
}) => {
  const routedFrames = await routeExampleModules(page, (route) =>
    route.abort(),
  );
  await page.goto("/react/recipes/combobox-group/", { waitUntil: "commit" });
  const iframe = await waitForShownFrame(page, "Combobox Group");
  expect(routedFrames).toContain("/react/previews/combobox-group/");
  // The server-rendered combobox has no name until hydration labels it.
  const combobox = query(iframe.contentFrame()).combobox();
  await expect(combobox).toHaveAttribute("aria-expanded", "false");
});

test("preview cards show a static example that opens its popup", async ({
  page,
}) => {
  // No recipe has a static example that opens its popup, so the card frame
  // loads a static preview page that asks to open it. The page has no island to
  // hydrate.
  await page.route("**/react/previews/combobox-group/", async (route) => {
    const url = new URL(
      "/astro/previews/ariakit-ui-shell-static/",
      route.request().url(),
    );
    const response = await route.fetch({ url: url.href });
    const html = await response.text();
    const body = html.replace("<html", "<html data-preview-open");
    await route.fulfill({ response, body });
  });
  await page.goto("/react/recipes/combobox-group/", { waitUntil: "commit" });
  const iframe = await waitForShownFrame(page, "Combobox Group");
  const toggle = query(iframe.contentFrame()).button("Toggle sidebar");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
});

test("preview cards hover the trigger of an example that opens on hover", async ({
  page,
}) => {
  await page.goto("/react/recipes/tooltip/", { waitUntil: "commit" });
  const iframe = await waitForShownFrame(page, "Tooltip");
  await iframe.scrollIntoViewIfNeeded();
  const preview = query(iframe.contentFrame());
  // The tooltip shows after its own delay, which the card does not wait for.
  await expect(preview.tooltip("Notifications")).toBeVisible();
  // The frame stays inactive, so the hover does not move focus into it.
  await expect(preview.button("Notifications")).not.toBeFocused();
  // The pointer over the docs page does not reach the frame, so the tooltip
  // stays open. A move in the frame would hide it in a 0ms timer, and the
  // tooltip would stay displayed for its 250ms exit transition and its 250ms
  // display transition, so the wait crosses the timer and both transitions.
  await page.mouse.move(0, 0, { steps: 4 });
  await flushFrames(page);
  await page.waitForTimeout(500);
  // A retrying assertion would also pass if the tooltip hid and showed again.
  expect(await preview.tooltip("Notifications").isVisible()).toBe(true);
});

test("compact preview cards take the minimum height of inline previews", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/recipes/tooltip/");
  const iframe = page.locator('iframe[title="Tooltip"]');
  // The next card in the grid renders its example inline, in a viewport that
  // takes the minimum height of the grid. The viewport is the first element in
  // the card that a click can focus.
  const inlineViewport = q
    .region("Keyboard Shortcuts", { exact: true })
    .locator("[tabindex='-1']")
    .first();
  const minHeight = await inlineViewport.evaluate((element) => {
    return Number.parseFloat(getComputedStyle(element).minHeight);
  });
  const frameBox = await iframe.boundingBox();
  expect(frameBox).not.toBeNull();
  if (!frameBox) return;
  expect(frameBox.height).toBe(minHeight);
});

test("preview cards show an example that throws", async ({ page }) => {
  // A broken example throws as it renders, so it never mounts.
  const routedFrames = await routeExampleModules(page, (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: "export default function Example() { throw new Error('Example'); }",
    }),
  );
  await page.goto("/react/recipes/combobox-group/", { waitUntil: "commit" });
  await waitForShownFrame(page, "Combobox Group");
  expect(routedFrames).toContain("/react/previews/combobox-group/");
});

test("preview cards resize their viewport from the end edge", async ({
  page,
  q,
}) => {
  // The card starts wider than the shell breakpoint that folds the sidebar.
  await page.setViewportSize({ width: 1600, height: 900 });
  await gotoAndSettle(page, "/react/recipes/app-shell/");
  const iframe = page.locator('iframe[title="App Shell"]');
  const preview = query(await waitForFrameHydration(iframe));
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
    await gotoAndSettle(page, "/react/recipes/skeleton/");
    for (const [title, shown] of [
      ["Animations", true],
      ["Timing", false],
    ] as const) {
      const card = q.region(title, { exact: true });
      await card.scrollIntoViewIfNeeded();
      // The card hydrates when it scrolls into view, and then measures the
      // width that the handle can resize to. On a slow runner, the cards on
      // this page can take longer than the assertion timeout to hydrate, so the
      // wait uses the test budget, like the preview hydration wait in
      // withFramework.
      // https://github.com/ariakit/ariakit/issues/8001
      const handle = query(card).separator("Resize preview", {
        includeHidden: true,
      });
      await handle
        .and(page.locator(":not([aria-valuemax='0'])"))
        .waitFor({ state: "attached" });
      await expect(handle).toBeVisible({ visible: shown });
    }
  });
}

test("preview grid cards keep their heights and stick within their row", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await gotoAndSettle(page, "/react/recipes/skeleton/");
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
  await waitForArticle(article);

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
  await gotoAndSettle(page, "/react/recipes/skeleton/");
  const article = q.region("Article", { exact: true });
  await waitForArticle(article);
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
  await gotoAndSettle(page, "/react/recipes/skeleton/");
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
      `/${framework}/previews/components/separator/`,
    );
    await card.button("Get code").click();
    await expect(q.region("Separator code")).toContainText(
      `@ariakit/${framework}`,
    );
  });
}
