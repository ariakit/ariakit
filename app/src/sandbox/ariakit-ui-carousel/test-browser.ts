import type { Locator, Page } from "@playwright/test";
import {
  capturePage,
  captureInView,
  forEachColorScheme,
  forEachColorSchemeOf,
  freezeScrollAnimations,
  skipWithoutScrollAnimations,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

// Scroll-driven animations and snapping differ between engines, so these tests
// run in every desktop browser. The row buttons show through scroll-driven
// animations, so their tests skip a browser without them. Reduced motion makes
// button scrolls instant, so the tests read the scroll position without waiting
// for an animation.

// Firefox reports fractional scroll positions, such as 358.67, where the tests
// compare whole pixels.
function getScrollLeft(viewport: Locator) {
  return viewport.evaluate((node) => Math.round(Math.abs(node.scrollLeft)));
}

function getScrollEnd(viewport: Locator) {
  return viewport.evaluate((node) => node.scrollWidth - node.clientWidth);
}

/** The visible width of a row less the fades and buttons at both ends. */
function getViewStep(viewport: Locator) {
  return viewport.evaluate((node) => {
    const style = getComputedStyle(node);
    const start = Number.parseFloat(style.scrollPaddingInlineStart);
    const end = Number.parseFloat(style.scrollPaddingInlineEnd);
    return node.clientWidth - start - end;
  });
}

/**
 * The scroll position that aligns an item of a row, or a slide, with the start
 * of the row, clear of the fade and the button there.
 */
function getItemOffset(item: Locator) {
  return item.evaluate((node) => {
    const viewport = node.parentElement;
    if (!viewport) return Number.NaN;
    const style = getComputedStyle(viewport);
    const padding = Number.parseFloat(style.scrollPaddingInlineStart);
    const rect = node.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    // The offset runs from the start of the row in the writing direction.
    const start =
      style.direction === "rtl"
        ? viewportRect.right - rect.right
        : rect.left - viewportRect.left;
    const offset = start + Math.abs(viewport.scrollLeft);
    return Math.round(Math.max(0, offset - padding));
  });
}

async function reduceMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
}

withCaptures(import.meta.dirname, async ({ test, query }) => {
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      await freezeScrollAnimations(page);
      await capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-carousel/page",
      });
    });
  });

  test("shows the last slides @visual", async ({ page, q, visual }) => {
    await forEachColorSchemeOf(
      page,
      ["Slides per view", "Slides with fades"],
      async (colorScheme) => {
        for (const name of ["Slides per view", "Slides with fades"]) {
          const box = query(q.article(name));
          const tabs = box.tab();
          await tabs.last().click();
          await test
            .expect(tabs.last())
            .toHaveAttribute("aria-selected", "true");
          await test
            .expect(box.button("Next slide"))
            .toHaveAttribute("aria-disabled", "true");
        }
        await freezeScrollAnimations(page);
        for (const name of ["Slides per view", "Slides with fades"]) {
          await captureInView({
            visual,
            box: q.article(name),
            colorScheme,
            item: `ariakit-ui-carousel/last-slides-${name === "Slides per view" ? "thirds" : "fades"}`,
          });
        }
      },
    );
  });

  test("scrolls a row by the visible width less the fades and buttons", async ({
    page,
    q,
  }) => {
    await skipWithoutScrollAnimations(page);
    await reduceMotion(page);
    const box = query(q.article("Filter row"));
    const viewport = box.toolbar("Filters");
    const next = box.button("Scroll forward");
    const previous = box.button("Scroll backward", { includeHidden: true });
    await test.expect(previous).toBeHidden();
    await test.expect(previous).toHaveAttribute("aria-disabled", "true");
    const step = await getViewStep(viewport);
    await next.click();
    await test.expect.poll(() => getScrollLeft(viewport)).toBe(step);
    await test.expect(previous).toBeVisible();
    await test.expect(previous).not.toHaveAttribute("aria-disabled", "true");
  });

  test("moves a row by at least the part that the fade and button cover", async ({
    page,
    q,
  }) => {
    await skipWithoutScrollAnimations(page);
    await reduceMotion(page);
    const box = query(q.article("Filter row"));
    const viewport = box.toolbar("Filters");
    const next = box.button("Scroll forward", { includeHidden: true });
    const padding = await viewport.evaluate((node) =>
      Number.parseFloat(getComputedStyle(node).scrollPaddingInlineEnd),
    );
    const end = await getScrollEnd(viewport);
    let offset = await getScrollLeft(viewport);
    const steps: number[] = [];
    // The button takes aria-disabled a frame after the scroll ends, so the loop
    // follows the scroll position, and the last press doesn't wait for a
    // disabled button.
    while (offset < end - 2) {
      await next.click();
      await test.expect.poll(() => getScrollLeft(viewport)).not.toBe(offset);
      const nextOffset = await getScrollLeft(viewport);
      steps.push(nextOffset - offset);
      offset = nextOffset;
    }
    await test.expect(next).toHaveAttribute("aria-disabled", "true");
    // The last press goes on to the end instead of leaving a short step.
    test.expect(steps.length).toBeGreaterThan(1);
    test.expect(Math.min(...steps)).toBeGreaterThanOrEqual(padding);
  });

  test("keeps a hovered row button past the end of the row", async ({
    page,
    q,
  }) => {
    await skipWithoutScrollAnimations(page);
    await reduceMotion(page);
    const box = query(q.article("Filter row"));
    const next = box.button("Scroll forward", { includeHidden: true });
    const buttonBox = await next.boundingBox();
    if (!buttonBox) throw new Error("The button has no layout");
    const x = buttonBox.x + buttonBox.width / 2;
    const y = buttonBox.y + buttonBox.height / 2;
    for (let i = 0; i < 12; i++) {
      if ((await next.getAttribute("aria-disabled")) === "true") break;
      await page.mouse.click(x, y);
    }
    await test.expect(next).toHaveAttribute("aria-disabled", "true");
    // Quick clicks run past the end. They stay on the disabled button and don't
    // reach the last chip under it.
    await page.mouse.click(x, y);
    await page.mouse.click(x, y);
    await test.expect(next).toBeVisible();
    await test.expect(box.button("Tooling")).not.toBeFocused();
    await page.mouse.move(x, y + 200);
    await test.expect(next).toBeHidden();
  });

  test("keeps focus on an item when a button is pressed", async ({
    page,
    q,
  }) => {
    await skipWithoutScrollAnimations(page);
    await reduceMotion(page);
    const box = query(q.article("Filter row"));
    const viewport = box.toolbar("Filters");
    const design = box.button("Design");
    await design.focus();
    await box.button("Scroll forward").click();
    await test.expect.poll(() => getScrollLeft(viewport)).toBeGreaterThan(0);
    await test.expect(design).toBeFocused();
  });

  test("moves focus to the other button at the end of a row", async ({
    page,
    q,
  }) => {
    await skipWithoutScrollAnimations(page);
    await reduceMotion(page);
    const box = query(q.article("Filter row"));
    const viewport = box.toolbar("Filters");
    const next = box.button("Scroll forward", { includeHidden: true });
    const previous = box.button("Scroll backward", { includeHidden: true });
    await next.focus();
    const end = await getScrollEnd(viewport);
    while ((await getScrollLeft(viewport)) < end - 2) {
      const left = await getScrollLeft(viewport);
      await page.keyboard.press("Enter");
      await test.expect
        .poll(() => getScrollLeft(viewport))
        .toBeGreaterThan(left);
    }
    await test.expect(previous).toBeFocused();
    await test.expect(next).toBeHidden();
    await test.expect(next).toHaveAttribute("aria-disabled", "true");
  });

  test("moves focus to the other button at the end of a row in a frame", async ({
    page,
  }) => {
    await skipWithoutScrollAnimations(page);
    await reduceMotion(page);
    const frame = page.frameLocator("iframe[title='Framed filters']");
    const box = query(frame.locator("body"));
    const viewport = box.toolbar("Framed filters");
    const next = box.button("Scroll forward", { includeHidden: true });
    const previous = box.button("Scroll backward", { includeHidden: true });
    await next.focus();
    const end = await getScrollEnd(viewport);
    while ((await getScrollLeft(viewport)) < end - 2) {
      const left = await getScrollLeft(viewport);
      await page.keyboard.press("Enter");
      await test.expect
        .poll(() => getScrollLeft(viewport))
        .toBeGreaterThan(left);
    }
    await test.expect(previous).toBeFocused();
  });

  test("scrolls a row to the next item", async ({ page, q }) => {
    await skipWithoutScrollAnimations(page);
    await reduceMotion(page);
    const box = query(q.article("Row steps"));
    const byItem = box.toolbar("Filters by item");
    // An item step aligns an item with the start of the row, clear of the fade
    // and button there. It skips the items that would move the row less than
    // they cover.
    const itemOffsets = await Promise.all(
      (await query(byItem).button().all()).map(getItemOffset),
    );
    const padding = await byItem.evaluate((node) =>
      Number.parseFloat(getComputedStyle(node).scrollPaddingInlineStart),
    );
    await box.button("Scroll forward").click();
    await test.expect.poll(() => getScrollLeft(byItem)).not.toBe(0);
    const nextItem = itemOffsets.find((offset) => offset >= padding);
    test.expect(await getScrollLeft(byItem)).toBe(nextItem);
  });

  test("keeps the view step in a row inside an item-step row", async ({
    page,
    q,
  }) => {
    await skipWithoutScrollAnimations(page);
    await reduceMotion(page);
    const box = query(q.article("Nested rows"));
    const inner = box.toolbar("Card filters");
    // A narrow row moves by at least half its width.
    const width = await inner.evaluate((node) => node.clientWidth);
    const step = Math.round(Math.max(await getViewStep(inner), width / 2));
    await query(inner.locator("..")).button("Scroll forward").click();
    await test.expect.poll(() => getScrollLeft(inner)).toBe(step);
  });

  test("shows the end button once added items overflow", async ({
    page,
    q,
  }) => {
    await skipWithoutScrollAnimations(page);
    const box = query(q.article("Growing row"));
    const next = box.button("Scroll forward", { includeHidden: true });
    await test.expect(next).toBeHidden();
    await box.button("Show all filters").click();
    await test.expect(next).toBeVisible();
    await test.expect(next).not.toHaveAttribute("aria-disabled", "true");
  });

  test("shows the end button once items grow past the row", async ({
    page,
    q,
  }) => {
    await skipWithoutScrollAnimations(page);
    await reduceMotion(page);
    const box = query(q.article("Growing row"));
    const viewport = box.toolbar("Growing filters");
    const next = box.button("Scroll forward", { includeHidden: true });
    await test.expect(next).toBeHidden();
    // A class widens the filters, without a resize of the row or a change to
    // its items, as when an image or a font loads.
    await box.button("Widen filters").click();
    await test.expect(next).toBeVisible();
    await test.expect(next).not.toHaveAttribute("aria-disabled", "true");
    await next.click();
    await test.expect.poll(() => getScrollLeft(viewport)).toBeGreaterThan(0);
  });

  // https://github.com/ariakit/ariakit/pull/8323#discussion_r4499748237
  test("enables the end button once wider gaps grow a row at its end", async ({
    page,
    q,
  }) => {
    await skipWithoutScrollAnimations(page);
    await reduceMotion(page);
    const box = query(q.article("Growing row"));
    const viewport = box.toolbar("Growing filters");
    const next = box.button("Scroll forward", { includeHidden: true });
    await box.button("Show all filters").click();
    await test.expect(next).toBeVisible();
    await viewport.evaluate((node) => {
      node.scrollTo({ left: node.scrollWidth, behavior: "instant" });
    });
    await test.expect(next).toHaveAttribute("aria-disabled", "true");
    const end = await getScrollLeft(viewport);
    // A wider gap adds scroll width past the end, while the row and its items
    // keep their sizes and the scroll position stays.
    await box.button("Widen gaps").click();
    await test.expect(next).not.toHaveAttribute("aria-disabled", "true");
    await next.click();
    await test.expect.poll(() => getScrollLeft(viewport)).toBeGreaterThan(end);
  });

  test("lands the slide buttons on slides", async ({ page, q }) => {
    await reduceMotion(page);
    const box = query(q.article("Slides"));
    const region = box.region("Projects");
    const next = box.button("Next slide");
    const previous = box.button("Previous slide");
    const viewport = page.locator(
      `[id="${await next.getAttribute("aria-controls")}"]`,
    );
    await test
      .expect(region)
      .toHaveAttribute("aria-roledescription", "carousel");
    await test.expect(previous).toBeVisible();
    await test.expect(previous).toHaveAttribute("aria-disabled", "true");
    await next.click();
    const second = box.group("2 of 7");
    const offset = await getItemOffset(second);
    await test.expect.poll(() => getScrollLeft(viewport)).toBe(offset);
    await test
      .expect(box.tab("Slide 2"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(previous).not.toHaveAttribute("aria-disabled", "true");
    await test
      .expect(region.locator("[aria-live]"))
      .toHaveText("Showing slide 2 of 7");
  });

  test("takes the pointer beside a button over the row", async ({
    page,
    q,
  }) => {
    await reduceMotion(page);
    const box = query(q.article("Slides"));
    const buttonBox = await box.button("Next slide").boundingBox();
    const slideBox = await box.group("1 of 7").boundingBox();
    if (!buttonBox || !slideBox) throw new Error("The carousel has no layout");
    // Above the round button and before it, near the top of the row, where a
    // slide would otherwise take the click.
    await page.mouse.click(buttonBox.x - 4, slideBox.y + 2);
    await test
      .expect(box.tab("Slide 2"))
      .toHaveAttribute("aria-selected", "true");
  });

  test("moves between slide tabs with the keyboard", async ({ page, q }) => {
    await reduceMotion(page);
    const box = query(q.article("Slides"));
    const first = box.tab("Slide 1");
    await test.expect(first).toHaveAttribute("aria-selected", "true");
    await test
      .expect(first)
      .toHaveAttribute(
        "aria-controls",
        (await box.group("1 of 7").getAttribute("id")) ?? "",
      );
    await first.focus();
    await page.keyboard.press("ArrowRight");
    await test.expect(box.tab("Slide 2")).toBeFocused();
    await test
      .expect(box.tab("Slide 2"))
      .toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await test.expect(box.tab("Slide 7")).toBeFocused();
    await test
      .expect(box.tab("Slide 7"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(box.button("Next slide"))
      .toHaveAttribute("aria-disabled", "true");
    await page.keyboard.press("Home");
    await test
      .expect(box.tab("Slide 1"))
      .toHaveAttribute("aria-selected", "true");
  });

  test("moves through slides in the writing direction", async ({ page, q }) => {
    await reduceMotion(page);
    const box = query(q.article("Right to left slides"));
    const second = box.group("2 of 7");
    await box.button("Next slide").click();
    await test
      .expect(box.tab("Slide 2"))
      .toHaveAttribute("aria-selected", "true");
    const offset = await getItemOffset(second);
    const viewport = second.locator("..");
    await test.expect.poll(() => getScrollLeft(viewport)).toBe(offset);
    // The next tab lies to the left.
    await box.tab("Slide 2").focus();
    await page.keyboard.press("ArrowLeft");
    await test.expect(box.tab("Slide 3")).toBeFocused();
    await test
      .expect(box.tab("Slide 3"))
      .toHaveAttribute("aria-selected", "true");
  });

  test("starts at the default slide", async ({ page, q }) => {
    await reduceMotion(page);
    const box = query(q.article("Default slide"));
    await test
      .expect(box.tab("Slide 4"))
      .toHaveAttribute("aria-selected", "true");
    const slide = box.group("4 of 7");
    const viewport = slide.locator("..");
    await test.expect
      .poll(
        async () =>
          (await getScrollLeft(viewport)) - (await getItemOffset(slide)),
      )
      .toBe(0);
    await test
      .expect(box.button("Previous slide"))
      .not.toHaveAttribute("aria-disabled", "true");
    // Nobody moved the carousel, so the status stays quiet, also when a resize
    // snaps it back to the same slide. It would speak STATUS_DELAY (300ms)
    // after the scroll that placed or snapped the slide, and no state shows
    // that it won't.
    const status = box.region().locator("[aria-live]");
    const offset = await getScrollLeft(viewport);
    await box.region().evaluate((node) => {
      if (!(node instanceof HTMLElement)) return;
      node.style.marginInlineEnd = "15px";
    });
    await test.expect.poll(() => getScrollLeft(viewport)).not.toBe(offset);
    await page.waitForTimeout(500);
    await test.expect(status).toHaveText("");
    await box.button("Next slide").click();
    await test.expect(status).toHaveText("Showing slide 5 of 7");
  });

  test("shows the selected slide of a carousel that mounts hidden", async ({
    page,
    q,
  }) => {
    await reduceMotion(page);
    const box = query(q.article("Slides in a tab panel"));
    const text = box.text("Selected project: Billing");
    const status = box.region("Projects in a tab").locator("[aria-live]");
    await test.expect(text).toBeVisible();
    await box.tab("Slides").click();
    await test
      .expect(box.tab("Slide 4"))
      .toHaveAttribute("aria-selected", "true");
    const slide = box.group("4 of 7");
    const viewport = slide.locator("..");
    await test.expect
      .poll(
        async () =>
          (await getScrollLeft(viewport)) - (await getItemOffset(slide)),
      )
      .toBe(0);
    // The carousel hides right after the scroll that placed the slide, and
    // stays hidden past STATUS_DELAY (300ms), when the status of that scroll
    // would read the hidden carousel. No state shows that moment.
    await box.tab("Details").click();
    await test.expect(slide).toBeHidden();
    await page.waitForTimeout(500);
    await test.expect(text).toBeVisible();
    // Showing it again keeps the selection and the quiet status. Another slide
    // would show on the frame after the ResizeObserver callback, and the status
    // would speak STATUS_DELAY later, and no state shows either moment.
    await box.tab("Slides").click();
    await test.expect(slide).toBeVisible();
    await page.waitForTimeout(500);
    await test
      .expect(box.tab("Slide 4"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(text).toBeVisible();
    await test.expect(status).toHaveText("");
  });

  test("paints the selected slide of a hidden carousel first", async ({
    page,
    q,
  }) => {
    await reduceMotion(page);
    const box = query(q.article("Slides in a tab panel"));
    // The tab is clicked in the page, so the scroll position can be read on the
    // second animation frame after the click, which follows the first paint of
    // the carousel.
    const painted = await box.tab("Slides").evaluate(
      (tab) =>
        new Promise<number>((resolve) => {
          const slide = document.querySelector(
            "[aria-label='Projects in a tab'] [aria-roledescription='slide']",
          );
          const viewport = slide?.parentElement;
          if (!(tab instanceof HTMLElement) || !viewport) {
            resolve(Number.NaN);
            return;
          }
          tab.click();
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve(Math.round(Math.abs(viewport.scrollLeft)));
            });
          });
        }),
    );
    const slide = box.group("4 of 7");
    await test.expect(slide).toBeVisible();
    test.expect(painted).toBe(await getItemOffset(slide));
  });

  test("follows a controlled selection both ways", async ({ page, q }) => {
    await reduceMotion(page);
    const box = query(q.article("Selected slide"));
    const viewport = box.group("4 of 7").locator("..");
    // The page selects Billing, the fourth slide, so the carousel starts there.
    await test
      .expect(box.tab("Slide 4"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(box.text("Selected project: Billing")).toBeVisible();
    // The page selects another slide, and the carousel scrolls to it.
    await box.button("Show Search").click();
    await test
      .expect(box.tab("Slide 5"))
      .toHaveAttribute("aria-selected", "true");
    const offset = await getItemOffset(box.group("5 of 7"));
    await test.expect.poll(() => getScrollLeft(viewport)).toBe(offset);
    // The carousel moves, and the page follows.
    await box.button("Next slide").click();
    await test.expect(box.text("Selected project: Onboarding")).toBeVisible();
    await box.tab("Slide 1").click();
    await test.expect(box.text("Selected project: Dashboard")).toBeVisible();
  });

  test("moves one slide at a time with several per view", async ({
    page,
    q,
  }) => {
    await reduceMotion(page);
    const box = query(q.article("Slides per view"));
    // Every slide keeps its own tab.
    await test.expect(box.tab()).toHaveCount(7);
    const next = box.button("Next slide");
    await next.click();
    await test
      .expect(box.tab("Slide 2"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(box.region().locator("[aria-live]"))
      .toHaveText("Showing slides 2 to 4 of 7");
    // The last three slides fill the row at the end.
    await box.tab("Slide 7").click();
    await test.expect(next).toHaveAttribute("aria-disabled", "true");
    await test
      .expect(box.region().locator("[aria-live]"))
      .toHaveText("Showing slides 5 to 7 of 7");
  });

  test("moves back from the end of several slides per view", async ({
    page,
    q,
  }) => {
    await reduceMotion(page);
    const box = query(q.article("Slides per view"));
    const status = box.region().locator("[aria-live]");
    // A wheel scroll reaches the end, where the last three slides show. Firefox
    // stops a wheel scroll with mandatory snapping at a snap position on the
    // way, so the wheel turns again until the row reaches its end.
    await box.group("1 of 7").hover();
    await test
      .expect(async () => {
        await page.mouse.wheel(4000, 0);
        await test
          .expect(box.button("Next slide"))
          .toHaveAttribute("aria-disabled", "true", { timeout: 1000 });
      })
      .toPass();
    await test.expect(status).toHaveText("Showing slides 5 to 7 of 7");
    await box.button("Previous slide").click();
    await test.expect(status).toHaveText("Showing slides 4 to 6 of 7");
    await test
      .expect(box.tab("Slide 4"))
      .toHaveAttribute("aria-selected", "true");
  });

  test("keeps a slide tab of the last view selected", async ({ page, q }) => {
    await reduceMotion(page);
    const box = query(q.article("Slides per view"));
    const tab = box.tab("Slide 6");
    await tab.click();
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    await test
      .expect(box.button("Next slide"))
      .toHaveAttribute("aria-disabled", "true");
    // Slides 5 to 7 all scroll to the end. The selection must stay after the
    // carousel stops following the target of the tab, 1.2s after the press
    // (TARGET_TIMEOUT), and no state shows when that happens.
    await page.waitForTimeout(1500);
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    await test.expect(tab).toBeFocused();
  });

  test("keeps a slide tab selected when every slide fits", async ({
    page,
    q,
  }) => {
    await reduceMotion(page);
    const box = query(q.article("Slides that fit"));
    const tab = box.tab("Slide 2");
    await tab.click();
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    // Both buttons are disabled, so the row is at both ends.
    await test
      .expect(box.button("Previous slide"))
      .toHaveAttribute("aria-disabled", "true");
    await test
      .expect(box.button("Next slide"))
      .toHaveAttribute("aria-disabled", "true");
    // The row doesn't scroll, so each slide is at both ends. The selection must
    // stay after the carousel stops following the target of the tab, 1.2s after
    // the press (TARGET_TIMEOUT), and no state shows when that happens.
    await page.waitForTimeout(1500);
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    await test.expect(tab).toBeFocused();
  });

  test("selects the slide tab that a wheel scroll stops on", async ({
    page,
    q,
  }) => {
    const box = query(q.article("Slides per view"));
    const slide = box.group("1 of 7");
    await slide.scrollIntoViewIfNeeded();
    await slide.hover();
    // Mandatory snapping stops on the nearest slide start, so the wheel moves
    // by the width of the row, which holds three slides.
    const width = await slide.evaluate(
      (node) => node.parentElement?.clientWidth,
    );
    await page.mouse.wheel(width ?? 0, 0);
    await test
      .expect(box.tab("Slide 4"))
      .toHaveAttribute("aria-selected", "true");
  });
});
