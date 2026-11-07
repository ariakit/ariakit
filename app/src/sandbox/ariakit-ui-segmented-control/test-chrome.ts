import type { query as getQuery } from "@ariakit/test/playwright";
import type { Locator } from "@playwright/test";
import { getCoveredWidth } from "#app/test-utils/ariakit-ui.ts";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

type Query = ReturnType<typeof getQuery>;

withFramework(import.meta.dirname, async ({ query, test }) => {
  // A press can't change a selected segment, so the bevel stays the same. The
  // press state isn't in the page captures.
  test("keeps the surface of a selected segment while pressed", async ({
    page,
    q,
  }) => {
    const segment = query(q.radiogroup("Raised")).radio("List");
    const box = await segment.boundingBox();
    if (!box) throw new Error("The segment has no box");
    const surface = () =>
      segment.evaluate((input) => {
        const label = input.closest("label");
        if (!label) return "";
        const { backgroundImage, boxShadow, scale } = getComputedStyle(label);
        return [backgroundImage, boxShadow, scale].join();
      });
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const resting = await surface();
    await page.mouse.down();
    // The surface must not change, so no assertion can wait for it. A press
    // would start within the 100ms --active-duration of the control.
    await page.waitForTimeout(100);
    test.expect(await surface()).toBe(resting);
    await page.mouse.up();
  });

  // The hover state isn't in the page captures.
  test("keeps the offset of a selected segment while hovered", async ({
    page,
    q,
  }) => {
    const segment = query(q.radiogroup("Outlined")).radio("List");
    const color = () =>
      segment.evaluate((input) => {
        const label = input.closest("label");
        if (!label) return "";
        return getComputedStyle(label).backgroundColor;
      });
    const resting = await color();
    await segment.hover();
    // The color must not change, so no assertion can wait for it. The surface
    // has no transition, so the hover state applies on the next frame.
    await flushFrames(page);
    test.expect(await color()).toBe(resting);
  });

  // Text directly in a card takes the color of the label. The hover state isn't
  // in the page captures.
  test("keeps the color of a disabled segment while hovered", async ({
    page,
    q,
  }) => {
    const segment = query(q.radiogroup("Stretched")).radio("Board");
    const color = () =>
      segment.evaluate((input) => {
        const label = input.closest("label");
        if (!label) return "";
        return getComputedStyle(label).color;
      });
    const resting = await color();
    await segment.hover({ force: true });
    // The color must not change, so no assertion can wait for it. The color has
    // no transition, so the hover state applies on the next frame.
    await flushFrames(page);
    test.expect(await color()).toBe(resting);
  });

  test("selects the next segmented tab with an arrow key and shows its panel", async ({
    page,
    q,
  }) => {
    await q.tab("Overview").focus();
    await page.keyboard.press("ArrowRight");
    await test
      .expect(q.tab("Activity"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Activity")).toHaveText("Recent changes");
  });
  // https://github.com/ariakit/ariakit/issues/8325
  // https://github.com/ariakit/ariakit/issues/8326
  // https://github.com/ariakit/ariakit/issues/8327
  for (const { example, getGroup, getItem, previous, next } of [
    {
      example: "Narrow",
      getGroup: (q: Query) => q.radiogroup("Narrow"),
      getItem: (group: Locator) => query(group).radio("List"),
      previous: "Scroll backward",
      next: "Scroll forward",
    },
    {
      example: "Narrow tabs",
      getGroup: (q: Query) => q.tablist("Narrow period"),
      getItem: (group: Locator) => query(group).tab("Day"),
      previous: "Previous tabs",
      next: "Next tabs",
    },
    {
      example: "Narrow buttons",
      getGroup: (q: Query) => q.group("Narrow pages"),
      getItem: (group: Locator) => query(group).link("Day"),
      previous: "Scroll backward",
      next: "Scroll forward",
    },
    {
      example: "Narrow navigation",
      getGroup: (q: Query) => q.navigation("Narrow range"),
      getItem: (group: Locator) => query(group).link("Day"),
      previous: "Scroll backward",
      next: "Scroll forward",
    },
  ]) {
    test(`scrolls the ${example.toLowerCase()} example with a button and keeps focus`, async ({
      page,
      q,
    }) => {
      // Reduced motion makes a button scroll at once.
      await page.emulateMedia({ reducedMotion: "reduce" });
      const box = query(q.article(example));
      const group = getGroup(q);
      const item = getItem(group);
      const previousButton = box.button(previous, { includeHidden: true });
      await item.focus();
      await test.expect(previousButton).toBeHidden();
      await box.button(next).click();
      await test.expect
        .poll(() => group.evaluate((node) => node.scrollLeft))
        .toBeGreaterThan(0);
      await test.expect(item).toBeFocused();
      await test.expect(previousButton).toBeVisible();
    });
  }

  // https://github.com/ariakit/ariakit/issues/8325
  test("scrolls a focused segmented tab clear of the fades and the buttons", async ({
    page,
    q,
  }) => {
    const box = query(q.article("Narrow tabs"));
    const list = q.tablist("Narrow period");
    const tabs = query(list);
    const buttons = [
      box.button("Previous tabs", { includeHidden: true }),
      box.button("Next tabs", { includeHidden: true }),
    ];
    await tabs.tab("Day").focus();
    for (const name of ["Week", "Month", "Quarter", "Year", "Day"]) {
      await page.keyboard.press(name === "Day" ? "Home" : "ArrowRight");
      const tab = tabs.tab(name);
      await test.expect(tab).toBeFocused();
      await test.expect
        .poll(() => getCoveredWidth({ viewport: list, item: tab, buttons }))
        .toBe(0);
    }
  });

  // A press focuses a tab before its click, so a scroll on focus would move the
  // tab away from the pointer.
  // https://github.com/ariakit/ariakit/issues/8325
  test("selects a segmented tab that a click finds under a fade", async ({
    page,
    q,
  }) => {
    const list = q.tablist("Narrow period");
    await list.scrollIntoViewIfNeeded();
    // A point in the end fade, just past the part of the list that it leaves
    // clear.
    const point = await list.evaluate((node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      const padding = Number.parseFloat(style.scrollPaddingInlineEnd);
      return { x: rect.right - padding + 4, y: rect.top + rect.height / 2 };
    });
    const name = await page.evaluate(({ x, y }) => {
      const tab = document.elementFromPoint(x, y)?.closest('[role="tab"]');
      return tab?.textContent;
    }, point);
    if (!name) throw new Error("No tab lies under the fade");
    await page.mouse.click(point.x, point.y);
    await test
      .expect(query(list).tab(name))
      .toHaveAttribute("aria-selected", "true");
  });

  // The root of a row paints its surface and holds its buttons, so it hides
  // with the element that scrolls.
  test("hides the surface and the buttons of a hidden row", async ({ q }) => {
    const box = query(q.article("Hidden"));
    const options = { includeHidden: true };
    const rows = [
      box.radiogroup("Hidden view", options),
      box.tablist("Hidden period", options),
      box.tablist("Hidden sections", options),
      box.group("Hidden pages", options),
      box.navigation("Hidden range", options),
    ];
    for (const row of rows) {
      await test.expect(row.locator("..")).toBeVisible();
    }
    await box.button("Hide the rows").click();
    for (const row of rows) {
      await test.expect(row.locator("..")).toBeHidden();
    }
  });
});
