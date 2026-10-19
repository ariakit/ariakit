import { query } from "@ariakit/test/playwright";
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
      // The card renders the handle only after it hydrates.
      const handle = query(card).separator("Resize preview", {
        includeHidden: true,
      });
      await expect(handle).toBeAttached();
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
      `/${framework}/previews/separator/_component/`,
    );
    await card.button("Get code").click();
    await expect(q.region("Separator code")).toContainText(
      `@ariakit/${framework}`,
    );
  });
}
