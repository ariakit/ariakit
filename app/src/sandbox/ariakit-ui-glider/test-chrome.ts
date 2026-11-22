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

  // Chrome shrinks a closed tab to no width. A browser that can't animate a
  // width from auto removes the tab at once, so the next tab doesn't move.
  test("moves the selected box at once to the tab that takes the place of a closed tab", async ({
    q,
  }) => {
    const box = query(q.article("Closable tabs"));
    const week = box.tab("Week");
    await test.expect(week).toHaveAttribute("aria-selected", "true");
    await week.focus();
    await test.expect(week).toBeFocused();
    // The box is presentation, and the closed tab shrinks on each frame, so
    // this probe reads the box and the selected tab in each frame of the
    // shrink. The glider observed the tab first, so it places the box before
    // this observer reads it, in the frame that shows. A read in a later task
    // can see the tabs at a later time than that frame on a busy machine.
    const samples = await week.evaluate(async (tab) => {
      const strip = tab.closest("[role='tablist']");
      if (!strip) return [];
      const samples: Array<{ left: number; offset: number }> = [];
      const sample = () => {
        const selected = strip.querySelector(
          "[role='tab'][aria-selected='true']",
        );
        const glider = strip.querySelector('.glider-box[data-selected="true"]');
        if (!selected || !glider) return;
        const { left } = selected.getBoundingClientRect();
        const offset = Math.abs(glider.getBoundingClientRect().left - left);
        samples.push({ left, offset });
      };
      const afterPaint = () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => setTimeout(resolve));
        });
      const observer = new ResizeObserver(sample);
      observer.observe(tab, { box: "border-box" });
      tab.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Delete", bubbles: true }),
      );
      for (let frame = 0; frame < 30 && tab.isConnected; frame++) {
        await afterPaint();
      }
      observer.disconnect();
      // Month moves once more when Week leaves the DOM, and then the tabs stay
      // in place, so a read after a frame sees the frame that shows.
      for (let frame = 0; frame < 3; frame++) {
        await afterPaint();
        sample();
      }
      return samples;
    });
    test.expect(samples.length).toBeGreaterThan(5);
    // Month moves into the place of Week, so the box has a moving target.
    const lefts = samples.map(({ left }) => left);
    test.expect(Math.max(...lefts) - Math.min(...lefts)).toBeGreaterThan(10);
    const offsets = samples.map(({ offset }) => offset);
    test.expect(Math.max(...offsets)).toBeLessThan(1);
    await test
      .expect(box.tab("Month"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(box.tab("Week")).toHaveCount(0);
  });

  // Chrome shrinks a closed tab to no width, like in the test above.
  test("moves the hover box at once with a tab that moves while a tab closes", async ({
    q,
  }) => {
    const box = query(q.article("Closable tabs"));
    const month = box.tab("Month");
    const year = box.tab("Year");
    await year.hover();
    // The hover box is presentation with aria-hidden, so this probe reads it
    // and Year in each frame of the shrink of Month, after the glider places
    // the box, like in the test above. The close mark is aria-hidden too, so
    // the probe presses it on the frame where the samples start. The pointer
    // stays in the strip, so the hover box stays on Year while Year moves.
    await using yearHandle = await year.elementHandle();
    const samples = await month.evaluate(async (tab, hovered) => {
      const strip = tab.closest("[role='tablist']");
      const mark = tab.querySelector(":scope > [aria-hidden]:last-child");
      if (!strip || !hovered || !(mark instanceof HTMLElement)) return [];
      const samples: Array<{ place: number; offset: number }> = [];
      const observer = new ResizeObserver(() => {
        const glider = strip.querySelector(".glider-box.ui-hovered");
        if (!glider) return;
        const { left } = hovered.getBoundingClientRect();
        const offset = Math.abs(glider.getBoundingClientRect().left - left);
        // The strip can scroll back while Month shrinks, which keeps Year in
        // place on the screen, so this reads its place in the strip.
        samples.push({ place: left + strip.scrollLeft, offset });
      });
      observer.observe(tab, { box: "border-box" });
      mark.click();
      for (let frame = 0; frame < 30 && tab.isConnected; frame++) {
        await new Promise((resolve) => {
          requestAnimationFrame(() => setTimeout(resolve));
        });
      }
      observer.disconnect();
      return samples;
    }, yearHandle);
    test.expect(samples.length).toBeGreaterThan(3);
    // Year moves in the strip, so the hover box has a moving target.
    const places = samples.map(({ place }) => place);
    test.expect(Math.max(...places) - Math.min(...places)).toBeGreaterThan(10);
    const offsets = samples.map(({ offset }) => offset);
    test.expect(Math.max(...offsets)).toBeLessThan(1);
    await test.expect(box.tab("Month")).toHaveCount(0);
  });

  // Chrome shrinks a closed tab to no width, like in the tests above. Without
  // Day, the strip doesn't overflow at this width, so Month keeps its place and
  // its distance to the end of the strip while Year closes.
  test("ends a travel at once when a tab after its target closes", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 700, height: 800 });
    const box = query(q.article("Closable tabs"));
    // The close mark is presentation with aria-hidden, so this probe presses
    // it.
    await box.tab("Day").evaluate((tab) => {
      const mark = tab.querySelector(":scope > [aria-hidden]:last-child");
      if (mark instanceof HTMLElement) {
        mark.click();
      }
    });
    await test.expect(box.tab("Day")).toHaveCount(0);
    await q.combobox(/^Travel time/).selectOption({ label: "Very slow (3s)" });
    const month = box.tab("Month");
    await month.click();
    await test.expect(month).toHaveAttribute("aria-selected", "true");
    // The box and the close mark are presentation with aria-hidden, so this
    // probe presses the mark of Year and reads the box after Year leaves. The
    // tabs then stay in place, so a read after a frame sees the frame that
    // shows.
    const result = await box.tab("Year").evaluate(async (tab) => {
      const strip = tab.closest("[role='tablist']");
      const mark = tab.querySelector(":scope > [aria-hidden]:last-child");
      if (!strip || !(mark instanceof HTMLElement)) return null;
      const overflow = strip.scrollWidth - strip.clientWidth;
      const afterPaint = () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => setTimeout(resolve));
        });
      mark.click();
      for (let frame = 0; frame < 60 && tab.isConnected; frame++) {
        await afterPaint();
      }
      for (let frame = 0; frame < 2; frame++) {
        await afterPaint();
      }
      const selected = strip.querySelector(
        "[role='tab'][aria-selected='true']",
      );
      const glider = strip.querySelector('.glider-box[data-selected="true"]');
      if (!selected || !glider) return null;
      const { left } = selected.getBoundingClientRect();
      const offset = Math.abs(glider.getBoundingClientRect().left - left);
      return { overflow, offset };
    });
    if (!result) {
      throw new Error("The closable tabs have no strip or close mark");
    }
    // A strip that overflows would change the distance from Month to its end
    // while Year closes, which would move the box at once anyway.
    test.expect(result.overflow).toBe(0);
    // The travel to Month takes 3 seconds, but the items settle in a fraction
    // of that, and the box goes to Month at once with them.
    test.expect(result.offset).toBeLessThan(1);
  });

  // Chrome shrinks a closed tab to no width, like in the tests above.
  test("lets the panel transition again when the glider turns off while a tab closes", async ({
    q,
  }) => {
    const box = query(q.article("Closable tabs"));
    const week = box.tab("Week");
    await week.focus();
    await test.expect(week).toBeFocused();
    const hydrated = q.checkbox(/^Hydrated/);
    // The panel follows the box, which stays instant while Week shrinks. The
    // glider turns off after it moved the box at once a few times, and before
    // Week leaves, so this probe presses Delete and clears the checkbox two
    // frames later. The panel is presentation for the transition, so the probe
    // reads its computed style, which has no transition while it is instant.
    await using checkboxHandle = await hydrated.elementHandle();
    const before = await week.evaluate(async (tab, checkbox) => {
      const follower = tab
        .closest("article")
        ?.querySelector(".glider-follower");
      if (!follower || !(checkbox instanceof HTMLElement)) return null;
      tab.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Delete", bubbles: true }),
      );
      for (let frame = 0; frame < 2; frame++) {
        await new Promise((resolve) => {
          requestAnimationFrame(() => setTimeout(resolve));
        });
      }
      const { transitionProperty } = getComputedStyle(follower);
      checkbox.click();
      return transitionProperty;
    }, checkboxHandle);
    // The glider turned off while the panel was still instant.
    test.expect(before).toBe("none");
    await test.expect(hydrated).not.toBeChecked();
    await test.expect(week).toHaveCount(0);
    const panel = box.tabpanel("Month");
    await test.expect
      .poll(() =>
        panel.evaluate((element) => {
          const follower = element.closest(".glider-follower");
          if (!follower) return null;
          return getComputedStyle(follower).transitionProperty;
        }),
      )
      .toBe("--glider-start, --glider-end");
  });
});
