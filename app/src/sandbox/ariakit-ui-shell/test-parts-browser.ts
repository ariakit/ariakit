import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox, getSidebar, selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ q }) => {
    await selectScenario(q, "parts");
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
      await expect(header).toHaveCSS("height", "65px");
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
    await expect(nestedHeader).toHaveCSS("top", "130px");
    await expect(q.complementary("Part details")).toHaveCSS("top", "130px");
    await expect(q.navigation("Part navigation")).toHaveCSS("top", "65px");
    await q.checkbox("Wide global border").check();
    for (const header of [mainHeader, sidebarHeader]) {
      await expect(header).toHaveCSS("height", "67px");
    }
    await q.checkbox("Compact local headers").check();
    for (const header of [mainHeader, sidebarHeader]) {
      await expect(header).toHaveCSS("height", "56px");
    }
    await expect(nestedHeader).toHaveCSS("top", "123px");
    await page.evaluate(() => window.scrollTo(0, 700));
    await expect
      .poll(async () => (await getBox(mainHeader)).y)
      .toBeCloseTo(67, 0);
    await q.checkbox("Sticky main header").uncheck();
    await expect(nestedHeader).toHaveCSS("top", "67px");
    await expect(q.complementary("Part details")).toHaveCSS("top", "67px");
    await q.checkbox("Global header").uncheck();
    await expect(mainHeader).toHaveCSS("height", "56px");
    await q.checkbox("Compact local headers").uncheck();
    await expect(mainHeader).toHaveCSS("height", "65px");
    await expect(nestedHeader).toHaveCSS("top", "0px");
  });

  test("preserves local percentage and length maximum widths", async ({
    q,
    page,
  }) => {
    await q.checkbox("Center parts").check();
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

  for (const centered of [false, true]) {
    test(`keeps shared geometry in ${centered ? "centered" : "fluid"} parts when text sizes differ`, async ({
      q,
      page,
    }) => {
      await q.checkbox("Use spacing gutter").check();
      await q.checkbox("Center parts").setChecked(centered);
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
          await expect(header).toHaveCSS("height", "65px");
        }
        const contentBox = await getBox(content);
        if (centered) {
          expect(contentBox.width).toBeCloseTo(480, 0);
        } else {
          expect(contentBox.x - (await getBox(q.main())).x).toBeCloseTo(12, 0);
        }
        for (const part of [actions, q.heading("Explicit shell parts")]) {
          expect((await getBox(part)).x).toBeCloseTo(contentBox.x, 0);
          expect((await getBox(part)).width).toBeCloseTo(contentBox.width, 0);
        }
        await expect(nestedHeader).toHaveCSS("top", "130px");
        await q.checkbox("Compact local headers").check();
        for (const header of [mainHeader, sidebarHeader]) {
          await expect(header).toHaveCSS("height", "56px");
        }
        await expect(nestedHeader).toHaveCSS("top", "121px");
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
          from === "main" ? "65px" : "130px",
        );
        await expect(q.complementary("More details")).toHaveCSS(
          "top",
          from === "main" ? "65px" : "130px",
        );
        for (const mode of ["fluid", "shell", "main"]) {
          await q.checkbox("Center parts").setChecked(mode !== "fluid");
          await q.checkbox("Center within main").setChecked(mode === "main");
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
      await expect(q.complementary("More details")).toHaveCSS("top", "130px");
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
    expect((await getBox(q.main())).y).toBeCloseTo(65, 0);
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
    await expect.poll(async () => (await getBox(header)).y).toBeCloseTo(65, 0);
  });

  test("selects shared padding from the nearest shell width and supports local overrides", async ({
    q,
    page,
  }) => {
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
    await q.checkbox("Center parts").check();
    await q.combobox("End sidebar starts at").selectOption("main");
    const sidebar = getSidebar(q, "Part details");
    await expect(sidebar).toHaveCSS("width", "160px");
    const toggle = q.checkbox("Open end sidebar");
    await using input = await toggle.elementHandle();
    // Reverse inside the frame recorder. A test-process round trip can miss the
    // entire fold on a busy runner.
    await using recording = await sidebar.evaluateHandle((column, input) => {
      if (!(input instanceof HTMLInputElement))
        throw new Error("Missing toggle");
      const header = document.querySelector('[aria-label="Main actions"]');
      const intro = document.querySelector(".shell-main-intro > h1");
      const body = document.querySelector('[aria-label="Main content"]');
      const panel = column.firstElementChild;
      if (!header || !intro || !body || !panel)
        throw new Error("Missing main parts");
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
