import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";
import {
  routeExampleModules,
  waitForFrameHydration,
  waitForShownFrame,
} from "./preview-cards-helpers.ts";

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

test("compact preview cards take the minimum height of inline previews", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/recipes/tooltip/");
  const iframe = page.locator('iframe[title="Tooltip"]');
  // The next card in the grid renders its example inline, in a viewport that
  // takes the minimum height of the grid. The card shares a row, so it hides
  // its handle, which still names the viewport it resizes.
  const card = query(q.region("Keyboard Shortcuts", { exact: true }));
  const handle = card.separator("Resize preview", { includeHidden: true });
  const viewportId = await handle.getAttribute("aria-controls");
  const inlineViewport = page.locator(`[id="${viewportId}"]`);
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
