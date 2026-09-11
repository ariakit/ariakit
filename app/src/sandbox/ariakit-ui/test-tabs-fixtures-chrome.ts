import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "tabs-fixtures" },
  async ({ test, query }) => {
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
      await test
        .expect(box.tab("Code"))
        .toHaveAttribute("aria-disabled", "true");

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
  },
);
