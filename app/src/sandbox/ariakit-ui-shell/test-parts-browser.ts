import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox, getSidebar, selectScenario } from "./test-helpers.ts";

// Main's gutter is 1rem, or 2rem from a 64rem shell. Fragment targets in the
// body keep it below the sticky headers.
function getScrollGap(shellWidth: number) {
  return shellWidth < 1024 ? 16 : 32;
}

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ q }) => {
    await selectScenario(q, "parts");
  });

  test("fits sticky sidebar panels to a size container around the shell", async ({
    q,
  }) => {
    const panel = q.navigation("Part navigation");
    await expect(panel).toHaveCSS("max-height", "836px");
    // The 40rem pane minus the 64px sticky header, instead of the viewport.
    await q.checkbox("Size container pane").check();
    await expect(panel).toHaveCSS("max-height", "576px");
    await q.checkbox("Size container pane").uncheck();
    await expect(panel).toHaveCSS("max-height", "836px");
  });

  test("sets the space above and below the parts with $py on main", async ({
    q,
    page,
  }) => {
    await q.combobox("Main header visibility").selectOption("never");
    // A set space resolves at main, so the larger text of the intro doesn't
    // change it.
    await q.combobox("Local text size").selectOption("text-lg");
    const intro = page.locator(".shell-main-intro");
    const body = q.main().locator(":scope > .shell-main-body");
    const nestedBody = page.locator(
      "#nested-parts-shell > .shell-main > .shell-main-body",
    );
    // At main's 16px: the 2rem page gutter, none, 10 steps, and 2em. The
    // default intro doesn't take the gutter from main, so its fluid 14 bar
    // steps apply at this shell width.
    for (const [option, space, introSpace] of [
      ["Gutter", 32, 56],
      ["None", 0, 0],
      ["10 steps", 40, 40],
      ["2em", 32, 32],
    ] as const) {
      await q.combobox("Main block padding").selectOption(option);
      await expect(intro).toHaveCSS("padding-block-start", `${introSpace}px`);
      await expect(body).toHaveCSS("padding-block-end", `${space}px`);
      // The space below the intro stays fluid, whatever main sets, and the body
      // keeps three bar steps above it.
      await expect(intro).toHaveCSS("padding-block-end", "56px");
      await expect(body).toHaveCSS("padding-block-start", "12px");
      await expect(q.region("Main content")).toHaveCSS(
        "scroll-margin-block-start",
        `${64 + Math.max(16, space)}px`,
      );
      // The nested main keeps its own 1rem gutter.
      await expect(nestedBody).toHaveCSS("padding-block-start", "16px");
    }
  });

  test("grows the intro space with the shell width and sets it with $py", async ({
    q,
    page,
  }) => {
    await q.combobox("Main header visibility").selectOption("never");
    const intro = page.locator(".shell-main-intro");
    const title = q.heading("Explicit shell parts");
    const body = q.main().locator(":scope > .shell-main-body");
    const getIntroSpace = () =>
      intro.evaluate((node) =>
        Number.parseFloat(getComputedStyle(node).paddingBlockStart),
      );
    const getSpaceError = async () => {
      const box = await getBox(intro);
      // 5% of the intro width in whole pixels, between 5 and 14 bar steps.
      const expected = Math.round(Math.min(56, Math.max(20, box.width * 0.05)));
      const end = await intro.evaluate((node) =>
        Number.parseFloat(getComputedStyle(node).paddingBlockEnd),
      );
      return Math.max(
        Math.abs((await getIntroSpace()) - expected),
        Math.abs(end - expected),
      );
    };
    for (const width of [375, 900, 1440, 2000]) {
      await page.setViewportSize({ width, height: 800 });
      await expect.poll(getSpaceError).toBeLessThan(0.1);
    }
    // A sidebar beside the intro reduces the space. The end sidebar that starts
    // at the body doesn't, so the space returns when it stops being beside it.
    await page.setViewportSize({ width: 1200, height: 800 });
    await q.combobox("End sidebar starts at").selectOption("intro");
    await expect.poll(getSpaceError).toBeLessThan(0.1);
    const besideSpace = await getIntroSpace();
    await q.combobox("End sidebar starts at").selectOption("body");
    await expect.poll(getIntroSpace).toBeGreaterThan(besideSpace);
    await expect.poll(getSpaceError).toBeLessThan(0.1);
    await q.combobox("End sidebar starts at").selectOption("intro");
    await expect.poll(getIntroSpace).toBe(besideSpace);
    await q.checkbox("Second start sidebar").check();
    await expect.poll(getIntroSpace).toBeLessThan(besideSpace);
    await expect.poll(getSpaceError).toBeLessThan(0.1);
    await q.checkbox("Second start sidebar").uncheck();
    await page.setViewportSize({ width: 1440, height: 800 });
    await q.checkbox("More targets in the intro").check();
    // A nested main doesn't take the space of an intro around it: the 64px page
    // header and the minimum 16px, not the 56px of the intro.
    await expect(q.text("Nested shell target")).toHaveCSS(
      "scroll-margin-block-start",
      "80px",
    );
    // This target has a larger font and sits in a query container, and the
    // space still resolves at the intro.
    const queryTarget = q.text("Query container target");
    for (const [option, space] of [
      ["Auto", 56],
      ["Gutter", 32],
      ["None", 0],
      ["10 steps", 40],
    ] as const) {
      await q.combobox("Intro block padding").selectOption(option);
      await expect(intro).toHaveCSS("padding-block-start", `${space}px`);
      await expect(intro).toHaveCSS("padding-block-end", `${space}px`);
      await expect(body).toHaveCSS("padding-block-start", "12px");
      // A target in the intro stops where it starts, so a table of contents
      // marks it current at the top of the page.
      const margin = `${64 + Math.max(16, space)}px`;
      await expect(title).toHaveCSS("scroll-margin-block-start", margin);
      await expect(queryTarget).toHaveCSS("scroll-margin-block-start", margin);
    }
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
      const nestedHeader = page.locator("#nested-parts-shell > .shell-header");
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
      // Playwright can scroll the page to click "Narrow shell", such as when it
      // retries the click while the columns still move.
      // https://github.com/ariakit/ariakit/issues/7595
      await page.evaluate(() => window.scrollTo(0, 0));
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
      const nestedHeader = page.locator("#nested-parts-shell > .shell-header");
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
          `${(visible ? 128 : 64) + getScrollGap(width)}px`,
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
      const nestedHeader = page.locator("#nested-parts-shell > .shell-header");
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
          `${64 + getScrollGap(width)}px`,
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

  const sidebarNames = [
    "Part navigation",
    "More navigation",
    "Part details",
    "More details",
  ];

  // Each visibility gets its own test. In one test, these widths took up to the
  // whole 30s budget on the Safari CI runner.
  const visibilityCases = [
    ["never", [1440, false], [700, false]],
    ["always", [700, true]],
    ["default", [767, false], [768, true]],
    ["5xl", [1023, false], [1024, true]],
    ["max-5xl", [1023, true], [1024, false]],
  ] as const;

  for (const [visibility, ...widths] of visibilityCases) {
    test(`applies ${visibility} sidebar visibility to all four columns`, async ({
      q,
      page,
    }) => {
      await q.checkbox("Second start sidebar").check();
      await q.checkbox("Second end sidebar").check();
      // Change the visibility at the first width, so the change itself can show
      // or hide the sidebars.
      const [[firstWidth]] = widths;
      await page.setViewportSize({ width: firstWidth, height: 900 });
      await q.combobox("Start sidebar visibility").selectOption(visibility);
      await q.combobox("End sidebar visibility").selectOption(visibility);
      for (const [width, visible] of widths) {
        await page.setViewportSize({ width, height: 900 });
        for (const name of sidebarNames) {
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
    });
  }

  test("preserves the closed state of a sidebar that the shell width hides", async ({
    q,
  }) => {
    await q.checkbox("Second start sidebar").check();
    await q.checkbox("Second end sidebar").check();
    await q.combobox("Start sidebar visibility").selectOption("max-5xl");
    await q.combobox("End sidebar visibility").selectOption("max-5xl");
    for (const name of sidebarNames) {
      await expect(getSidebar(q, name)).toHaveCSS("width", "0px");
    }
    await q.checkbox("Narrow shell").check();
    for (const name of sidebarNames) {
      await expect(getSidebar(q, name)).toHaveCSS("width", "160px");
    }
    await q.checkbox("Open end sidebar").uncheck();
    await expect(getSidebar(q, "Part details")).toHaveCSS("width", "0px");
    await q.checkbox("Narrow shell").uncheck();
    for (const name of sidebarNames) {
      await expect(getSidebar(q, name)).toHaveCSS("width", "0px");
    }
    await q.checkbox("Narrow shell").check();
    await expect(getSidebar(q, "More details")).toHaveCSS("width", "160px");
    await expect(getSidebar(q, "Part details")).toHaveCSS("width", "0px");
    await expect(q.checkbox("Open end sidebar")).not.toBeChecked();
    await q.checkbox("Open end sidebar").check();
    await expect(getSidebar(q, "Part details")).toHaveCSS("width", "160px");
  });

  test("inherits outer height and contains local borders in explicit presets", async ({
    q,
    page,
  }) => {
    const mainHeader = page.locator(".shell-main-header");
    const sidebarHeader = page.locator(".shell-sidebar-header");
    const nestedHeader = page.locator("#nested-parts-shell > .shell-header");
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
    const middle = page.locator("#nested-parts-shell");
    const inner = page.locator("#inner-parts-shell");
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
      const nestedHeader = page.locator("#nested-parts-shell > .shell-header");
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
    // Playwright can scroll the page when it retries a click on a checkbox that
    // moves after the shell rows change, and main scrolls with the page.
    // https://github.com/ariakit/ariakit/issues/8059
    await page.evaluate(() => window.scrollTo(0, 0));
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
    const nested = page.locator("#nested-parts-shell");
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
