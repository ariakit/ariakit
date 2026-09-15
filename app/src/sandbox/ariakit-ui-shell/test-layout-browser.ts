import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox, getSidebar, selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ q }) => {
    await selectScenario(q, "geometry");
  });

  // https://github.com/ariakit/ariakit/issues/7532
  test("aligns the default bar padding and main gutter and changes them independently", async ({
    q,
  }) => {
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
    await expect(q.banner()).toHaveCSS("height", "52px");
    await q.checkbox("Compact gutter").check();
    expect((await getBox(content)).x).toBeCloseTo(8, 0);
    expect((await getBox(headerText)).x).toBeCloseTo(24, 0);
    await q.checkbox("Wide bar padding").check();
    expect((await getBox(content)).x).toBeCloseTo(8, 0);
    expect((await getBox(headerText)).x).toBeCloseTo(48, 0);
    expect((await getBox(footerText)).x).toBeCloseTo(48, 0);
    await expect(q.banner()).toHaveCSS("height", "52px");
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
      (await getBox(q.main())).width,
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
      .poll(async () => (await getBox(q.main())).x)
      .toBeCloseTo(192, 0);
    await q.checkbox("Wide navigation").check();
    await q.checkbox("Large header").check();
    await expect(start).toHaveCSS("width", "320px");
    await expect(end).toHaveCSS("width", "160px");
    await expect
      .poll(async () => (await getBox(q.main())).x)
      .toBeCloseTo(320, 0);
    await expect(q.banner()).toHaveCSS("height", "64px");
    await expect(q.navigation("Layout navigation")).toHaveCSS("top", "64px");
  });

  // https://github.com/ariakit/ariakit/issues/7532
  test("starts contents below the intro and sticks its body under the header", async ({
    page,
    q,
  }) => {
    await q.button("Toggle layout navigation").click();
    await q.button("Toggle layout contents").click();
    const start = getSidebar(q, "Layout navigation");
    const end = getSidebar(q, "Layout contents");
    const intro = page.locator('[aria-label="Page introduction"]');
    expect((await getBox(start)).y).toBeCloseTo((await getBox(intro)).y, 0);
    expect((await getBox(end)).y).toBeCloseTo((await getBox(q.main())).y, 0);
    expect((await getBox(end)).y).toBeGreaterThan((await getBox(intro)).y);
    const introBox = await getBox(intro);
    expect(introBox.x + introBox.width).toBeCloseTo(1440, 0);
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect
      .poll(async () => (await getBox(q.navigation("Layout contents"))).y)
      .toBeCloseTo(52, 0);
    await expect(page.locator(".shell")).toHaveCSS("overflow-x", "visible");
    await expect(q.main()).toHaveCSS("overflow-x", "clip");
    await expect(intro).toHaveCSS("overflow-x", "clip");
  });

  for (const width of [1440, 560]) {
    // https://github.com/ariakit/ariakit/issues/7532
    test(`aligns breakout text and nested subgrids at ${width}px without a wide table shrinking the content`, async ({
      page,
      q,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await q.checkbox("Centered content").check();
      const content = await getBox(q.main().locator("#layout-content"));
      const bands = [];
      for (const name of ["Popout", "Feature", "Full"]) {
        const band = page.locator(`[aria-label="${name} band"]`);
        const text = await getBox(
          query(band).text(`${name} text`, { exact: true }),
        );
        expect(text.x).toBeCloseTo(content.x, 0);
        expect(text.width).toBeCloseTo(content.width, 0);
        await expect(band).toHaveCSS("padding-left", "0px");
        await expect(band).toHaveCSS("container-type", "normal");
        bands.push(await getBox(band));
      }
      const [popout, feature, full] = bands;
      if (!popout || !feature || !full) {
        throw new Error("Missing breakout");
      }
      expect(popout.width).toBeGreaterThanOrEqual(content.width);
      expect(feature.width).toBeGreaterThanOrEqual(popout.width);
      expect(full.width).toBeCloseTo((await getBox(q.main())).width, 0);
      const nested = await getBox(
        page.locator('[aria-label="Nested popout band"]'),
      );
      expect(nested.x).toBeCloseTo(popout.x, 0);
      expect(nested.width).toBeCloseTo(popout.width, 0);
      if (width === 1440) {
        expect(content.width).toBeCloseTo(640, 0);
        expect(popout.width).toBeCloseTo(672, 0);
        expect(feature.width).toBeCloseTo(784, 0);
      } else {
        expect(content.width).toBeGreaterThan(300);
      }
      await q.checkbox("Centered content").uncheck();
      const fluidContent = await getBox(q.main().locator("#layout-content"));
      expect(
        (await getBox(page.locator('[aria-label="Popout band"]'))).width,
      ).toBeCloseTo(fluidContent.width, 0);
      expect(
        (await getBox(page.locator('[aria-label="Feature band"]'))).width,
      ).toBeCloseTo(fluidContent.width, 0);
    });
  }

  // https://github.com/ariakit/ariakit/issues/7532
  test("collapses an open sidebar at 3xl with the fold and compensation together", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await q.checkbox("Centered content").check();
    await q.button("Toggle layout navigation").click();
    const sidebar = getSidebar(q, "Layout navigation");
    const link = query(sidebar).link("Layout section");
    const toggle = q.button("Toggle layout navigation");
    await expect(sidebar).toHaveCSS("width", "192px");
    await link.focus();
    await expect(link).toBeFocused();
    // Start recording before the resize. Resolving a locator after it can take
    // longer than the fold on a busy runner.
    await using recording = await sidebar.evaluateHandle((column) => {
      const main = column.parentElement?.querySelector(".shell-main");
      if (!main) {
        throw new Error("Missing main");
      }
      const samples: { width: number; space: number; visibility: string }[] =
        [];
      const finished = new Promise<typeof samples>((resolve) => {
        const sample = () => {
          const width = column.getBoundingClientRect().width;
          samples.push({
            width,
            space: Number.parseFloat(
              getComputedStyle(main).getPropertyValue("--shell-start-1-space"),
            ),
            visibility: getComputedStyle(column).visibility,
          });
          if (width === 0) {
            resolve(samples);
          } else {
            requestAnimationFrame(sample);
          }
        };
        sample();
      });
      return { finished };
    });
    await page.setViewportSize({ width: 740, height: 900 });
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const samples = await recording.evaluate(({ finished }) => finished);
    expect(
      samples.some((sample) => sample.width > 0 && sample.width < 192),
    ).toBe(true);
    for (const sample of samples) {
      expect(Math.abs(sample.width - sample.space)).toBeLessThan(2);
      if (sample.width > 0) {
        expect(sample.visibility).toBe("visible");
      }
    }
    await expect(sidebar).toHaveCSS("width", "0px");
    await expect(link).toBeHidden();
    await expect(q.navigation("Layout navigation")).toHaveCount(0);
    await q.combobox("Scenario").focus();
    await page.keyboard.press("Tab");
    if (await q.checkbox("Right to left").isVisible()) {
      await page.keyboard.press("Tab");
    }
    await expect(toggle).toBeFocused();
    await page.setViewportSize({ width: 800, height: 900 });
    await q.checkbox("Centered content").check();
    await expect(link).toBeVisible();
    await expect(sidebar).toHaveCSS("width", "192px");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  // https://github.com/ariakit/ariakit/issues/7532
  test("aligns intro and main content with a sidebar that starts below the intro", async ({
    page,
    q,
  }) => {
    await q.button("Toggle layout navigation").click();
    await expect(getSidebar(q, "Layout navigation")).toHaveCSS(
      "width",
      "192px",
    );
    const toggle = q.button("Toggle layout contents");
    const end = getSidebar(q, "Layout contents");
    const heading = q.heading("Columns and frames");
    const content = q.main().locator("#layout-content");
    for (const centered of [false, true]) {
      await q.checkbox("Centered content").setChecked(centered);
      for (const open of [false, true, false]) {
        if ((await toggle.getAttribute("aria-expanded")) !== String(open)) {
          await toggle.click();
        }
        await expect(end).toHaveCSS("width", open ? "160px" : "0px");
        await expect
          .poll(
            async () => (await getBox(heading)).x - (await getBox(content)).x,
          )
          .toBeCloseTo(0, 0);
        await expect
          .poll(
            async () =>
              (await getBox(heading)).width - (await getBox(content)).width,
          )
          .toBeCloseTo(0, 0);
        const intro = await getBox(
          page.locator('[aria-label="Page introduction"]'),
        );
        expect(intro.x + intro.width).toBeCloseTo(1440, 0);
      }
    }
  });
});
