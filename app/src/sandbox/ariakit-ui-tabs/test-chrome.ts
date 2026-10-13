import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7482
  test("moves and selects tabs in right-to-left order", async ({ page, q }) => {
    const box = query(q.article("Right to left"));
    const drafts = box.tab("المسودات");
    const review = box.tab("قيد المراجعة");
    const published = box.tab("المنشورة");

    await drafts.click();
    await page.keyboard.press("ArrowLeft");
    await test.expect(review).toBeFocused();
    await test.expect(review).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await test.expect(drafts).toBeFocused();
    await test.expect(drafts).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await test.expect(published).toBeFocused();
    await test.expect(published).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowLeft");
    await test.expect(drafts).toBeFocused();
    await test.expect(drafts).toHaveAttribute("aria-selected", "true");
  });

  for (const [name, label] of [
    ["Default", "Preview"],
    ["Overflowing strip", "Overview"],
    ["Tabs record", "Usage"],
    ["Tabs record", "Code"],
  ] as const) {
    // https://github.com/ariakit/ariakit/issues/7482
    test(`renders a phrasing label in ${name}: ${label}`, async ({ q }) => {
      const tab = query(q.article(name)).tab(label);
      await test.expect(tab).toHaveJSProperty("tagName", "BUTTON");
      await test
        .expect(query(tab).text(label, { exact: true }))
        .toHaveJSProperty("tagName", "SPAN");
    });
  }

  test("moves keyboard focus between tabs without selecting", async ({
    page,
    q,
  }) => {
    const box = query(q.article("Folder glider"));
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
