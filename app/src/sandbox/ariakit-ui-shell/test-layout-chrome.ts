import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import {
  getBox,
  getGutter,
  getSidebar,
  selectScenario,
} from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ q }) => {
    await selectScenario(q, "geometry");
  });

  // https://github.com/ariakit/ariakit/issues/7532
  test("aligns the default bar padding and main gutter and changes them independently", async ({
    q,
  }) => {
    await q.checkbox("Unbounded content").check();
    const content = q.main().locator("#layout-content");
    const headerText = q.banner().locator(".shell-bar-start > span");
    const footerText = q.text("Layout footer", { exact: true });
    expect((await getBox(content)).x).toBeCloseTo(
      (await getBox(headerText)).x,
      0,
    );
    expect((await getBox(content)).x).toBeCloseTo(
      (await getBox(footerText)).x,
      0,
    );
    await expect(q.banner()).toHaveCSS("height", "64px");
    await q.checkbox("Compact gutter").check();
    expect((await getBox(content)).x).toBeCloseTo(8, 0);
    // The default bar inset keeps following the fluid gutter.
    expect((await getBox(headerText)).x).toBeCloseTo(getGutter(1440), 0);
    await q.checkbox("Wide bar padding").check();
    expect((await getBox(content)).x).toBeCloseTo(8, 0);
    expect((await getBox(headerText)).x).toBeCloseTo(48, 0);
    expect((await getBox(footerText)).x).toBeCloseTo(48, 0);
    await expect(q.banner()).toHaveCSS("height", "64px");
  });

  // https://github.com/ariakit/ariakit/issues/7532
  test("passes the gutter and square shell radius to nested frames", async ({
    page,
    q,
  }) => {
    const inset = page.locator('[aria-label="Inset frame"]');
    const flush = page.locator('[aria-label="Flush frame"]');
    await expect(page.locator(".shell")).toHaveCSS(
      "border-top-left-radius",
      "0px",
    );
    await expect(inset).toHaveCSS("border-top-left-radius", "8px");
    await q.checkbox("Compact gutter").check();
    await expect(inset).toHaveCSS("border-top-left-radius", "12px");
    await q.checkbox("Flush gutter").check();
    await expect(flush).toHaveCSS("border-bottom-left-radius", "20px");
    expect((await getBox(flush)).width).toBeCloseTo(
      (await getBox(q.main().locator(":scope > .shell-main-body"))).width,
      0,
    );
  });

  // https://github.com/ariakit/ariakit/issues/7532
  test("publishes each sidebar width and header height from the part", async ({
    q,
  }) => {
    await q.button("Toggle layout navigation").click();
    await q.button("Toggle layout contents").click();
    const start = getSidebar(q, "Layout navigation");
    const end = getSidebar(q, "Layout contents");
    await expect(start).toHaveCSS("width", "192px");
    await expect(end).toHaveCSS("width", "160px");
    await expect
      .poll(
        async () =>
          (await getBox(q.main().locator(":scope > .shell-main-body"))).x,
      )
      .toBeCloseTo(192, 0);
    await q.checkbox("Wide navigation").check();
    await q.checkbox("Large header").check();
    await expect(start).toHaveCSS("width", "320px");
    await expect(end).toHaveCSS("width", "160px");
    await expect
      .poll(
        async () =>
          (await getBox(q.main().locator(":scope > .shell-main-body"))).x,
      )
      .toBeCloseTo(320, 0);
    await expect(q.banner()).toHaveCSS("height", "72px");
    await expect(q.navigation("Layout navigation")).toHaveCSS("top", "72px");
  });
});
