import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("moves keyboard focus between tabs without selecting", async ({
    page,
    q,
  }) => {
    const box = query(q.article("Folder tabs"));
    await box.tab("Code").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(box.tab("Usage")).toBeFocused();
    await test
      .expect(box.tab("Usage"))
      .toHaveAttribute("aria-selected", "false");
    await test.expect(box.tab("Code")).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Enter");
    await test
      .expect(box.tab("Usage"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(box.tab("Code"))
      .toHaveAttribute("aria-selected", "false");
  });

  test("lets an overflowing strip scroll to the tabs that do not fit", async ({
    page,
    q,
  }) => {
    const strip = query(q.article("Overflowing strip")).tablist(
      "Overflowing strip",
    );
    await strip.hover();
    await page.mouse.wheel(400, 0);
    await test.expect
      .poll(() => strip.evaluate((node) => node.scrollLeft))
      .toBeGreaterThan(0);
  });

  test("selects a folder tab without animating its curves or the panel corners", async ({
    q,
  }) => {
    const box = query(q.article("Full-width strip with the last tab selected"));
    await box.tab("Preview").click();
    const usage = box.tab("Usage");
    // Records the curves and the panel corners on the frames after the tab is
    // selected. A transition, or a curve that overflows the strip for a moment,
    // shows as more than one value. The promise stays open while Playwright
    // clicks the tab.
    const recording = usage.evaluate((tab) => {
      const panel = tab
        .closest(".tabs")
        ?.querySelector(":scope > [role=tablist] + *");
      if (!panel) throw new Error("Missing tab panels");
      const sizes = new Set<string>();
      return new Promise<string[]>((resolve) => {
        let selectedFrames = 0;
        let frames = 0;
        const record = () => {
          frames += 1;
          if (tab.getAttribute("aria-selected") === "true") {
            selectedFrames += 1;
            const curves = `${getComputedStyle(tab, "::before").width} ${getComputedStyle(tab, "::after").width}`;
            const { borderTopLeftRadius, borderTopRightRadius } =
              getComputedStyle(panel);
            sizes.add(
              `${curves} ${borderTopLeftRadius} ${borderTopRightRadius}`,
            );
          }
          // 30 frames outlast a tab transition. The total cap ends the record
          // if the click never selects the tab.
          if (selectedFrames > 30 || frames > 600) {
            resolve([...sizes]);
            return;
          }
          requestAnimationFrame(record);
        };
        requestAnimationFrame(record);
      });
    });
    await usage.click();
    await test.expect(usage).toHaveAttribute("aria-selected", "true");
    test.expect(await recording).toHaveLength(1);
  });

  // Regression fixtures.
  for (const name of ["Project", "Team"]) {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781700
    test(`keeps the ${name.toLowerCase()} panel visible with an explicit store`, async ({
      q,
    }) => {
      const box = query(q.article("Tab panel shared store"));
      await test.expect(box.tabpanel(`${name} activity`)).toBeVisible();
      await box.tab(`${name} reviews`).click();
      await test.expect(box.tabpanel(`${name} reviews`)).toBeVisible();
      await test.expect(box.text(`${name} review updates`)).toBeVisible();
      await box.tab(`${name} activity`).click();
      await test.expect(box.tabpanel(`${name} activity`)).toBeVisible();
      await test.expect(box.text(`${name} activity updates`)).toBeVisible();
    });
  }

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781700
  test("preserves an explicit tabId on a single panel", async ({ q }) => {
    const box = query(q.article("Tab panel shared store"));
    await test.expect(box.tabpanel("Pinned activity")).toBeVisible();
    await box.tab("Pinned reviews").click();
    await test
      .expect(box.tab("Pinned reviews"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(box.tabpanel("Pinned activity")).not.toBeVisible();
    await box.tab("Pinned activity").click();
    await test.expect(box.tabpanel("Pinned activity")).toBeVisible();
  });

  test("a tabs record keys its tabs and passes tab props", async ({
    page,
    q,
  }) => {
    const box = query(q.article("Tabs record"));
    // defaultSelectedId names a record key, so the keys are the tab ids.
    await test
      .expect(box.tab("Usage"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(box.tab("Code")).toHaveAttribute("aria-disabled", "true");

    await box.tab("Preview").click();
    await test
      .expect(box.tab("Preview"))
      .toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await test.expect(box.tab("Code")).toBeFocused();
    await test
      .expect(box.tab("Code"))
      .toHaveAttribute("aria-selected", "false");
    await test
      .expect(box.tab("Preview"))
      .toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await test
      .expect(box.tab("Usage"))
      .toHaveAttribute("aria-selected", "true");
  });
});
