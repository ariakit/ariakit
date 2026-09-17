import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox, getSidebar, selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ q }) => {
    await selectScenario(q, "parts");
  });

  test("starts sidebars beside the main header by default", async ({
    q,
    page,
  }) => {
    await q.combobox("End sidebar starts at").selectOption("default");
    const header = page.locator(".shell-main-header");
    for (const name of ["Part navigation", "Part details"]) {
      expect((await getBox(getSidebar(q, name))).y).toBeCloseTo(
        (await getBox(header)).y,
        0,
      );
    }
    expect((await getBox(header)).width).toBeCloseTo(
      (await getBox(q.main().locator(":scope > .shell-main-body"))).width,
      0,
    );
  });

  for (const from of ["intro", "body"]) {
    test(`shows the main header above its breakpoint and releases sticky ${from} sidebars below it`, async ({
      q,
      page,
    }) => {
      await q.combobox("End sidebar starts at").selectOption(from);
      await q.checkbox("Second end sidebar").check();
      await q.combobox("Main header visibility").selectOption("5xl");
      const header = page.locator(".shell-main-header");
      const nestedHeader = page.locator(
        '[aria-label="Nested parts shell"] > .shell-header',
      );
      await expect(header).toBeVisible();
      await q.checkbox("Narrow shell").check();
      await expect(header).toBeHidden();
      for (const name of ["Part details", "More details"]) {
        await expect(q.complementary(name)).toBeVisible();
        await expect(q.complementary(name)).toHaveCSS("top", "64px");
        await expect(q.complementary(name)).toHaveCSS("max-height", "836px");
      }
      await expect(nestedHeader).toHaveCSS("top", "64px");
      await expect(q.region("Main content")).toHaveCSS(
        "scroll-margin-block-start",
        "80px",
      );
      expect((await getBox(page.locator(".shell-main-intro"))).y).toBeCloseTo(
        64,
        0,
      );
      await page.evaluate(() => window.scrollTo(0, 700));
      await expect
        .poll(async () => (await getBox(q.complementary("Part details"))).y)
        .toBeCloseTo(64, 0);
      await q.checkbox("Narrow shell").uncheck();
      await expect(header).toBeVisible();
      await expect(q.complementary("Part details")).toHaveCSS("top", "128px");
      await expect(nestedHeader).toHaveCSS("top", "128px");
      await q.checkbox("Sticky main header").uncheck();
      await expect(q.complementary("Part details")).toHaveCSS("top", "64px");
      await q.combobox("Main header visibility").selectOption("always");
      await q.checkbox("Narrow shell").check();
      await expect(header).toBeVisible();
    });

    test(`shows the main header below its breakpoint and releases sticky ${from} sidebars above it`, async ({
      q,
      page,
    }) => {
      await q.combobox("End sidebar starts at").selectOption(from);
      await q.checkbox("Second end sidebar").check();
      await q.combobox("Main header visibility").selectOption("max-5xl");
      const header = page.locator(".shell-main-header");
      const nestedHeader = page.locator(
        '[aria-label="Nested parts shell"] > .shell-header',
      );
      await expect(header).toBeHidden();
      for (const width of [1023, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const visible = width < 1024;
        await expect(header).toBeVisible({ visible });
        for (const name of ["Part details", "More details"]) {
          await expect(q.complementary(name)).toHaveCSS(
            "top",
            visible ? "128px" : "64px",
          );
          await expect(q.complementary(name)).toHaveCSS(
            "max-height",
            visible ? "772px" : "836px",
          );
        }
        await expect(nestedHeader).toHaveCSS("top", visible ? "128px" : "64px");
        await expect(q.region("Main content")).toHaveCSS(
          "scroll-margin-block-start",
          visible ? "144px" : "80px",
        );
      }
      await q.checkbox("Narrow shell").check();
      await expect(header).toBeVisible();
      await expect(q.complementary("Part details")).toHaveCSS("top", "128px");
      await page.evaluate(() => window.scrollTo(0, 700));
      await expect
        .poll(async () => (await getBox(q.complementary("Part details"))).y)
        .toBeCloseTo(128, 0);
      await q.checkbox("Narrow shell").uncheck();
      await expect(header).toBeHidden();
      await page.evaluate(() => window.scrollTo(0, 700));
      await expect
        .poll(async () => (await getBox(q.complementary("Part details"))).y)
        .toBeCloseTo(64, 0);
    });

    test(`hides the main header at every width and releases sticky ${from} sidebars`, async ({
      q,
      page,
    }) => {
      await q.combobox("End sidebar starts at").selectOption(from);
      await q.checkbox("Second end sidebar").check();
      const header = page.locator(".shell-main-header");
      const nestedHeader = page.locator(
        '[aria-label="Nested parts shell"] > .shell-header',
      );
      for (const width of [1440, 1000]) {
        await page.setViewportSize({ width, height: 900 });
        await q.combobox("Main header visibility").selectOption("never");
        await expect(header).toBeHidden();
        for (const name of ["Part details", "More details"]) {
          await expect(q.complementary(name)).toBeVisible();
          await expect(q.complementary(name)).toHaveCSS("top", "64px");
          await expect(q.complementary(name)).toHaveCSS("max-height", "836px");
        }
        await expect(nestedHeader).toHaveCSS("top", "64px");
        await expect(nestedHeader).toBeVisible();
        await expect(q.region("Main content")).toHaveCSS(
          "scroll-margin-block-start",
          "80px",
        );
        await page.evaluate(() => window.scrollTo(0, 0));
        expect((await getBox(page.locator(".shell-main-intro"))).y).toBeCloseTo(
          64,
          0,
        );
        await page.evaluate(() => window.scrollTo(0, 700));
        await expect
          .poll(async () => (await getBox(q.complementary("Part details"))).y)
          .toBeCloseTo(64, 0);
        for (const visibility of ["always", "default"]) {
          await q.combobox("Main header visibility").selectOption(visibility);
          await expect(header).toBeVisible();
          await expect(q.complementary("Part details")).toHaveCSS(
            "top",
            "128px",
          );
          await expect(nestedHeader).toHaveCSS("top", "128px");
        }
      }
    });
  }

  test("applies sidebar visibility to all four columns and preserves closed state", async ({
    q,
    page,
  }) => {
    await q.checkbox("Second start sidebar").check();
    await q.checkbox("Second end sidebar").check();
    const names = [
      "Part navigation",
      "More navigation",
      "Part details",
      "More details",
    ];
    const cases = [
      ["never", 1440, false],
      ["never", 700, false],
      ["always", 700, true],
      ["default", 767, false],
      ["default", 768, true],
      ["5xl", 1023, false],
      ["5xl", 1024, true],
      ["max-5xl", 1023, true],
      ["max-5xl", 1024, false],
    ] as const;
    for (const [visibility, width, visible] of cases) {
      await page.setViewportSize({ width, height: 900 });
      await q.combobox("Start sidebar visibility").selectOption(visibility);
      await q.combobox("End sidebar visibility").selectOption(visibility);
      for (const name of names) {
        await expect(getSidebar(q, name)).toHaveCSS(
          "width",
          visible ? "160px" : "0px",
        );
        await expect(getSidebar(q, name).locator(":scope > *")).toBeVisible({
          visible,
        });
      }
      expect(
        (await getBox(q.main().locator(":scope > .shell-main-body"))).width,
      ).toBeCloseTo(width - (visible ? 640 : 0), 0);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await q.checkbox("Narrow shell").check();
    for (const name of names) {
      await expect(getSidebar(q, name)).toHaveCSS("width", "160px");
    }
    await q.checkbox("Open end sidebar").uncheck();
    await expect(getSidebar(q, "Part details")).toHaveCSS("width", "0px");
    await q.checkbox("Narrow shell").uncheck();
    for (const name of names) {
      await expect(getSidebar(q, name)).toHaveCSS("width", "0px");
    }
    await q.checkbox("Narrow shell").check();
    await expect(getSidebar(q, "More details")).toHaveCSS("width", "160px");
    await expect(getSidebar(q, "Part details")).toHaveCSS("width", "0px");
    await expect(q.checkbox("Open end sidebar")).not.toBeChecked();
    await q.checkbox("Open end sidebar").check();
    await expect(getSidebar(q, "Part details")).toHaveCSS("width", "160px");
  });

  test("keeps the introduction and local header in one main landmark", async ({
    q,
    page,
  }) => {
    await expect(q.main()).toHaveCount(1);
    await expect(q.main().locator("h1")).toHaveText("Explicit shell parts");
    await expect(q.main().locator(":scope > header")).toHaveText(
      "Page actions",
    );
    await expect(q.banner()).toHaveCount(1);
    await expect(q.contentinfo()).toHaveCount(0);
    await expect(q.main()).toHaveCSS("container-type", "normal");
    await expect(q.main()).toHaveCSS("overflow", "visible");
    await expect(page.locator(".shell-main").first()).toHaveCSS(
      "grid-template-rows",
      /subgrid/,
    );
  });

  test("inherits outer height and contains local borders in explicit presets", async ({
    q,
    page,
  }) => {
    const mainHeader = page.locator(".shell-main-header");
    const sidebarHeader = page.locator(".shell-sidebar-header");
    const nestedHeader = page.locator(
      '[aria-label="Nested parts shell"] > .shell-header',
    );
    for (const header of [mainHeader, sidebarHeader]) {
      await expect(header).toHaveCSS("height", "64px");
      await expect(header).toHaveCSS("border-bottom-width", "5px");
    }
    const headerBox = await getBox(mainHeader);
    const actionsBox = await getBox(
      page.locator('[aria-label="Main actions"]'),
    );
    expect(actionsBox.y + actionsBox.height / 2).toBeCloseTo(
      headerBox.y + (headerBox.height - 5) / 2,
      0,
    );
    await expect(nestedHeader).toHaveCSS("top", "128px");
    await expect(q.complementary("Part details")).toHaveCSS("top", "128px");
    await expect(q.navigation("Part navigation")).toHaveCSS("top", "64px");
    await q.checkbox("Wide global border").check();
    await expect(q.banner()).toHaveCSS("border-bottom-width", "3px");
    for (const header of [q.banner(), mainHeader, sidebarHeader]) {
      await expect(header).toHaveCSS("height", "64px");
    }
    await q.checkbox("Compact local headers").check();
    for (const header of [mainHeader, sidebarHeader]) {
      await expect(header).toHaveCSS("height", "56px");
    }
    await expect(nestedHeader).toHaveCSS("top", "120px");
    await page.evaluate(() => window.scrollTo(0, 700));
    await expect
      .poll(async () => (await getBox(mainHeader)).y)
      .toBeCloseTo(64, 0);
    await q.checkbox("Sticky main header").uncheck();
    await expect(nestedHeader).toHaveCSS("top", "64px");
    await expect(q.complementary("Part details")).toHaveCSS("top", "64px");
    await q.checkbox("Global header").uncheck();
    await expect(mainHeader).toHaveCSS("height", "56px");
    await q.checkbox("Compact local headers").uncheck();
    await expect(mainHeader).toHaveCSS("height", "64px");
    await expect(nestedHeader).toHaveCSS("top", "0px");
  });

  test("includes nested main headers in the three-level sticky chain", async ({
    q,
    page,
  }) => {
    await q.checkbox("Nested main headers").check();
    const middle = page.locator('[aria-label="Nested parts shell"]');
    const inner = page.locator('[aria-label="Inner parts shell"]');
    const middleHeader = middle.locator(
      ":scope > .shell-main > .shell-main-header",
    );
    const innerHeader = inner.locator(":scope > .shell-header");
    const innerMainHeader = inner.locator(
      ":scope > .shell-main > .shell-main-header",
    );
    await expect(middle.locator(":scope > .shell-header")).toHaveCSS(
      "top",
      "128px",
    );
    await expect(middleHeader).toHaveCSS("top", "192px");
    await expect(middleHeader).toHaveCSS("height", "56px");
    await expect(innerHeader).toHaveCSS("top", "248px");
    await expect(innerMainHeader).toHaveCSS("top", "312px");
    await expect(innerMainHeader).toHaveCSS("height", "72px");
    await q.checkbox("Taller nested main header").check();
    await expect(middleHeader).toHaveCSS("height", "72px");
    await expect(middleHeader).toHaveCSS("top", "192px");
    await expect(innerHeader).toHaveCSS("top", "264px");
    await expect(innerMainHeader).toHaveCSS("top", "328px");
    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect
      .poll(async () => (await getBox(innerHeader)).y)
      .toBeCloseTo(264, 0);
    await expect
      .poll(async () => (await getBox(innerMainHeader)).y)
      .toBeCloseTo(328, 0);
  });

  test("preserves local percentage and length maximum widths", async ({
    q,
    page,
  }) => {
    const intro = page.locator(".shell-main-intro");
    const width = (await getBox(intro)).width;
    const cases = [
      ["50%", width / 2],
      ["calc(100% - 10rem)", width - 160],
      ["min(40rem, 80%)", Math.min(640, width * 0.8)],
      ["20rem", 320],
    ] as const;
    for (const [value, expected] of cases) {
      await q.combobox("Intro maximum width").selectOption(value);
      await expect
        .poll(
          async () => (await getBox(q.heading("Explicit shell parts"))).width,
        )
        .toBeCloseTo(expected, 0);
      expect((await getBox(q.region("Main content"))).width).toBeCloseTo(
        480,
        0,
      );
      expect(
        (await getBox(page.locator('[aria-label="Main actions"]'))).width,
      ).toBeCloseTo(480, 0);
    }
  });

  for (const unbounded of [false, true]) {
    test(`keeps shared geometry in ${unbounded ? "unbounded" : "bounded"} parts when text sizes differ`, async ({
      q,
      page,
    }) => {
      await q.checkbox("Use spacing gutter").check();
      await q.checkbox("Unbounded content").setChecked(unbounded);
      const mainHeader = page.locator(".shell-main-header");
      const sidebarHeader = page.locator(".shell-sidebar-header");
      const actions = page.locator('[aria-label="Main actions"]');
      const content = q.region("Main content");
      const nestedHeader = page.locator(
        '[aria-label="Nested parts shell"] > .shell-header',
      );
      for (const size of ["text-sm", "text-lg"]) {
        await q.combobox("Local text size").selectOption(size);
        for (const header of [mainHeader, sidebarHeader]) {
          await expect(header).toHaveCSS("height", "64px");
        }
        const contentBox = await getBox(content);
        if (!unbounded) {
          expect(contentBox.width).toBeCloseTo(480, 0);
        } else {
          expect(contentBox.x - (await getBox(q.main())).x).toBeCloseTo(12, 0);
        }
        for (const part of [actions, q.heading("Explicit shell parts")]) {
          expect((await getBox(part)).x).toBeCloseTo(contentBox.x, 0);
          expect((await getBox(part)).width).toBeCloseTo(contentBox.width, 0);
        }
        await expect(nestedHeader).toHaveCSS("top", "128px");
        await q.checkbox("Compact local headers").check();
        for (const header of [mainHeader, sidebarHeader]) {
          await expect(header).toHaveCSS("height", "56px");
        }
        await expect(nestedHeader).toHaveCSS("top", "120px");
        await page.evaluate(() => window.scrollTo(0, 900));
        const headerBox = await getBox(mainHeader);
        expect((await getBox(q.complementary("Part details"))).y).toBeCloseTo(
          headerBox.y + headerBox.height,
          0,
        );
        await q.checkbox("Compact local headers").uncheck();
      }
    });
  }

  for (const rtl of [false, true]) {
    test(`spans only adjacent free end columns and aligns content in ${rtl ? "RTL" : "LTR"}`, async ({
      q,
      page,
    }) => {
      await q.checkbox("Right to left").setChecked(rtl);
      await q.checkbox("Second end sidebar").check();
      const body = q.main().locator(":scope > .shell-main-body");
      const header = page.locator(".shell-main-header");
      const intro = page.locator(".shell-main-intro");
      const bodyContent = q.region("Main content");
      const headerContent = page.locator('[aria-label="Main actions"]');
      const introContent = q.heading("Explicit shell parts");
      for (const from of ["main", "intro", "body"]) {
        await q.combobox("End sidebar starts at").selectOption(from);
        const width = (await getBox(body)).width;
        expect((await getBox(header)).width).toBeCloseTo(
          width + (from === "main" ? 0 : 320),
          0,
        );
        expect((await getBox(intro)).width).toBeCloseTo(
          width + (from === "body" ? 320 : 0),
          0,
        );
        await expect(q.complementary("Part details")).toHaveCSS(
          "top",
          from === "main" ? "64px" : "128px",
        );
        await expect(q.complementary("More details")).toHaveCSS(
          "top",
          from === "main" ? "64px" : "128px",
        );
        for (const unbounded of [false, true]) {
          await q.checkbox("Unbounded content").setChecked(unbounded);
          const content = await getBox(bodyContent);
          for (const part of [headerContent, introContent]) {
            await expect
              .poll(async () => {
                const [box, contentBox] = await Promise.all([
                  getBox(part),
                  getBox(bodyContent),
                ]);
                return box.x - contentBox.x;
              })
              .toBeCloseTo(0, 0);
            expect((await getBox(part)).width).toBeCloseTo(content.width, 0);
          }
        }
      }
      await q.combobox("End sidebar starts at").selectOption("main");
      await q.checkbox("Open end sidebar").uncheck();
      await expect(getSidebar(q, "Part details")).toHaveCSS("width", "0px");
      expect(
        (await getBox(header)).width - (await getBox(body)).width,
      ).toBeCloseTo(160, 0);
      await expect(q.complementary("More details")).toHaveCSS("top", "128px");
      await q.checkbox("Open end sidebar").check();
      await page.setViewportSize({ width: 700, height: 900 });
      await expect(getSidebar(q, "Part details")).toHaveCSS("width", "0px");
      await expect(getSidebar(q, "More details")).toHaveCSS("width", "0px");
      expect((await getBox(header)).width).toBeCloseTo(
        (await getBox(body)).width,
        0,
      );
    });
  }

  test("starts main sidebars at the first present main part without empty rows", async ({
    q,
    page,
  }) => {
    await q.combobox("End sidebar starts at").selectOption("main");
    const sidebar = getSidebar(q, "Part details");
    const header = page.locator(".shell-main-header");
    expect((await getBox(sidebar)).y).toBeCloseTo((await getBox(header)).y, 0);
    await q.checkbox("Main header").uncheck();
    expect((await getBox(sidebar)).y).toBeCloseTo(
      (await getBox(page.locator(".shell-main-intro"))).y,
      0,
    );
    await q.checkbox("Main intro").uncheck();
    expect((await getBox(sidebar)).y).toBeCloseTo(
      (await getBox(q.main().locator(":scope > .shell-main-body"))).y,
      0,
    );
    await expect(q.main()).toHaveCSS("top", "auto");
    expect((await getBox(q.main())).y).toBeCloseTo(64, 0);
  });

  test("keeps sidebar header and footer fixed while its body scrolls", async ({
    q,
    page,
  }) => {
    const panel = q.navigation("Part navigation");
    const header = panel.locator(".shell-sidebar-header");
    const footer = panel.locator(".shell-sidebar-footer");
    const body = panel.locator(".shell-sidebar-body");
    const headerBefore = await getBox(header);
    const footerBefore = await getBox(footer);
    await body.evaluate((node) => node.scrollTo(0, 500));
    await expect.poll(() => body.evaluate((node) => node.scrollTop)).toBe(500);
    expect((await getBox(header)).y).toBeCloseTo(headerBefore.y, 0);
    expect((await getBox(footer)).y).toBeCloseTo(footerBefore.y, 0);
    const panelBox = await getBox(panel);
    expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(900);
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect.poll(async () => (await getBox(header)).y).toBeCloseTo(64, 0);
  });

  test("selects shared padding from the nearest shell width and supports local overrides", async ({
    q,
    page,
  }) => {
    await q.checkbox("Unbounded content").check();
    const header = page.locator('[aria-label="Main actions"]');
    const intro = q.heading("Explicit shell parts");
    const body = q.region("Main content");
    const mainBox = await getBox(q.main());
    for (const part of [header, intro, body]) {
      expect((await getBox(part)).x - mainBox.x).toBeCloseTo(32, 0);
    }
    await q.checkbox("Open end sidebar").uncheck();
    await expect(getSidebar(q, "Part details")).toHaveCSS("width", "0px");
    expect((await getBox(body)).x - mainBox.x).toBeCloseTo(32, 0);
    const nested = page.locator('[aria-label="Nested parts shell"]');
    const nestedBox = await getBox(nested);
    expect((await getBox(nested.locator("p"))).x - nestedBox.x).toBeCloseTo(
      16,
      0,
    );
    await q.checkbox("Local intro padding").check();
    expect((await getBox(intro)).x - mainBox.x).toBeCloseTo(8, 0);
    expect((await getBox(header)).x - mainBox.x).toBeCloseTo(32, 0);
    await q.checkbox("Narrow shell").check();
    expect((await getBox(body)).x - mainBox.x).toBeCloseTo(16, 0);
    expect((await getBox(header)).x - mainBox.x).toBeCloseTo(16, 0);
  });
  test("aligns main parts throughout an interrupted end-sidebar fold", async ({
    q,
  }) => {
    await q.combobox("End sidebar starts at").selectOption("main");
    const sidebar = getSidebar(q, "Part details");
    await expect(sidebar).toHaveCSS("width", "160px");
    const toggle = q.checkbox("Open end sidebar");
    await using input = await toggle.elementHandle();
    // Reverse inside the frame recorder. A test-process round trip can miss the
    // entire fold on a busy runner.
    await using recording = await sidebar.evaluateHandle((column, input) => {
      if (!(input instanceof HTMLInputElement)) {
        throw new Error("Missing toggle");
      }
      const header = document.querySelector('[aria-label="Main actions"]');
      const intro = document.querySelector(".shell-main-intro > h1");
      const body = document.querySelector('[aria-label="Main content"]');
      const panel = column.firstElementChild;
      if (!header || !intro || !body || !panel) {
        throw new Error("Missing main parts");
      }
      const parts = [header, intro];
      const contentElement = body;
      const panelElement = panel;
      const toggleElement = input;
      const initialWidth = column.getBoundingClientRect().width;
      const initialTop = panel.getBoundingClientRect().top;
      const finished = new Promise<{
        alignment: number;
        panelShift: number;
        reversed: boolean;
      }>((resolve) => {
        let alignment = 0;
        let panelShift = 0;
        let reversed = false;
        function sample() {
          const width = column.getBoundingClientRect().width;
          const content = contentElement.getBoundingClientRect();
          for (const part of parts) {
            const box = part.getBoundingClientRect();
            alignment = Math.max(
              alignment,
              Math.abs(box.x - content.x),
              Math.abs(box.width - content.width),
            );
          }
          if (panelElement.getClientRects().length) {
            panelShift = Math.max(
              panelShift,
              Math.abs(panelElement.getBoundingClientRect().top - initialTop),
            );
          }
          if (
            !reversed &&
            !toggleElement.checked &&
            width > 0 &&
            width < initialWidth
          ) {
            reversed = true;
            toggleElement.click();
          }
          if (
            (!reversed && !toggleElement.checked && width === 0) ||
            (reversed && width === initialWidth)
          ) {
            resolve({ alignment, panelShift, reversed });
          } else {
            requestAnimationFrame(sample);
          }
        }
        sample();
      });
      return { finished };
    }, input);
    // check/uncheck verify the final state, which the recorder reverses.
    await toggle.click();
    const result = await recording.evaluate(({ finished }) => finished);
    expect(result.reversed).toBe(true);
    expect(result.alignment).toBeLessThan(2);
    expect(result.panelShift).toBeLessThan(2);
    await expect(toggle).toBeChecked();
    await expect(sidebar).toHaveCSS("width", "160px");
  });
});
