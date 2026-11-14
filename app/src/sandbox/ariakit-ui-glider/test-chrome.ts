import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("names each tab panel after its selected tab", async ({ q }) => {
    for (const [name, tab] of [
      ["Folder tabs", "Day"],
      ["Mixed tab kinds", "Folder"],
      ["Flat tab before folders", "Flat"],
    ] as const) {
      const box = query(q.article(name));
      await test.expect(box.tab(tab)).toHaveAttribute("aria-selected", "true");
      await test.expect(box.tabpanel(tab)).toBeVisible();
    }
  });

  test("shows the focus state of the selected folder on its box", async ({
    page,
    q,
  }) => {
    const box = query(q.article("Folder tabs"));
    const week = box.tab("Week");
    await week.click();
    // Tab moves the focus to the panel and Shift+Tab moves it back, with no new
    // selection.
    await page.keyboard.press("Tab");
    await test.expect(week).not.toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(week).toBeFocused();
    await test.expect(week).toHaveAttribute("aria-selected", "true");
    // The box is presentation with aria-hidden, so this probe reads it from the
    // DOM. The group hides the folder edges of the selected tab, so the box
    // draws its focus state.
    await test.expect
      .poll(() =>
        week.evaluate((element) => {
          const group = element.closest(".glider-group");
          const glider = group?.querySelector(
            '.glider-box[data-selected="true"]',
          );
          return glider?.hasAttribute("data-focus-visible");
        }),
      )
      .toBe(true);
  });

  test("keeps the icons of a sprite in the copies", async ({ q }) => {
    // The slow travel time keeps the copies in the box long enough to read
    // them.
    await q.combobox(/^Travel time/).selectOption({ label: "Slow (800ms)" });
    const article = q.article("Icons from a sprite");
    await query(article).radio("Calendar").click();
    // The copies are presentation with aria-hidden, so this probe reads them
    // from the DOM.
    await test.expect
      .poll(() =>
        article.evaluate((node) => {
          const uses = node.querySelectorAll(".glider-copy use");
          if (!uses.length) return false;
          return Array.from(uses).every(
            (use) => use.getAttribute("href") === "#glider-sprite-dot",
          );
        }),
      )
      .toBe(true);
  });

  test("shows a new count in the copies while the box travels", async ({
    q,
  }) => {
    // The very slow travel time keeps the copies in the box long enough to add
    // a card.
    await q.combobox(/^Travel time/).selectOption({ label: "Very slow (3s)" });
    const article = q.article("A count that changes");
    const box = query(article);
    const calendar = box.radio("Calendar");
    await calendar.click();
    const control = calendar.locator(
      "xpath=ancestor-or-self::*[contains(concat(' ', @class, ' '), ' control ')][1]",
    );
    await test.expect(control).toHaveAttribute("data-glider-masked");
    // The first card adds the badge to Board, and the second one changes only
    // the text of the badge.
    await box.button("Add a card").click();
    await box.button("Add a card").click();
    // The copies are presentation with aria-hidden, so this probe reads them
    // from the DOM. The box travels over Board, so Board has a copy in it.
    await test.expect
      .poll(() =>
        article.evaluate((node) => {
          const copies = Array.from(node.querySelectorAll(".glider-copy"));
          const texts = copies.map((copy) => copy.textContent?.trim());
          return texts.find((text) => text?.startsWith("Board")) ?? null;
        }),
      )
      .toBe("Board2");
  });
});
