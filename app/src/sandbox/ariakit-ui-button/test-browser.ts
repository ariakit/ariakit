import type { Locator } from "@playwright/test";
import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  getCapsOffset,
  getCapture,
  hoverOver,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { getBox } from "../ariakit-ui-shell/test-helpers.ts";

/**
 * Reads the OKLCH lightness of an element's background and of the layer it sits
 * on, which `--ak-layer-parent` holds.
 */
function getLightness(element: Locator) {
  return element.evaluate((node) => {
    const style = getComputedStyle(node);
    const parse = (color: string) => {
      const lightness = /^oklch\(([\d.]+)/.exec(color.trim())?.[1];
      if (!lightness) throw new Error(`Not an OKLCH color: ${color}`);
      return Number(lightness);
    };
    return {
      surface: parse(style.backgroundColor),
      parent: parse(style.getPropertyValue("--ak-layer-parent")),
    };
  });
}

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7806
  test("follows a native checkbox's checked state", async ({ q }) => {
    const example = q.article("Native checkbox selection");
    const checkbox = query(example).checkbox("Pin this item");
    const getBackground = () =>
      checkbox.evaluate((node) => getComputedStyle(node).backgroundColor);
    const idle = await getBackground();
    await checkbox.press("Space");
    await test.expect(checkbox).toBeChecked();
    await test.expect.poll(getBackground).not.toBe(idle);
    await checkbox.press("Space");
    await test.expect(checkbox).not.toBeChecked();
    await test.expect.poll(getBackground).toBe(idle);
  });

  // https://github.com/ariakit/ariakit/pull/7584
  test("keeps an initials avatar as far from the start edge as from the top", async ({
    q,
  }) => {
    const button = query(q.article("Initial avatar")).button(/Will Williams/);
    const avatar = button.locator(".control-slot").first();
    await button.scrollIntoViewIfNeeded();
    // A one-line slot sits one frame padding from the start edge, as far as
    // from the top. The avatar adjusts its font, so margins measured in its own
    // font would pull it closer to the edge.
    await test.expect
      .poll(async () => {
        const [outer, inner] = await Promise.all([
          getBox(button),
          getBox(avatar),
        ]);
        return inner.x - outer.x - (inner.y - outer.y);
      })
      .toBeCloseTo(0, 0);
  });

  // https://github.com/ariakit/ariakit/pull/7536#discussion_r4023546236
  test("keeps horizontal bar groups and their focus outline unclipped", async ({
    q,
    page,
  }) => {
    const group = q.radiogroup("Horizontal size");
    const small = query(group).radio("Small");
    const large = query(group).radio("Large");
    await small.click();
    await page.keyboard.press("ArrowRight");
    await test.expect(large).toBeFocused();
    await test.expect(large).toHaveCSS("outline-style", "solid");
    await test.expect(group).not.toHaveCSS("box-shadow", "none");
    await test.expect(group).toHaveCSS("clip-path", "none");
  });

  // Each engine rounds the half-leading of a line box its own way, so the badge
  // text centers only once its box is trimmed to the capitals.
  // https://github.com/ariakit/ariakit/issues/7588
  test("centers the badge text in its slot", async ({ q }) => {
    const text = query(q.article("Count badge")).text("12");
    await test.expect(text).toBeVisible();
    test.expect(await getCapsOffset(text)).toBeCloseTo(0, 1);
  });

  // https://github.com/ariakit/ariakit/issues/7589
  test("keeps the keys of a shortcut in order in a right-to-left row", async ({
    q,
  }) => {
    const box = q.article("Right to left shortcut");
    const [command, key] = await Promise.all([
      getBox(query(box).text("⌘")),
      getBox(query(box).text("S")),
    ]);
    test.expect(command.x).toBeLessThan(key.x);
  });

  // https://github.com/ariakit/ariakit/issues/7589
  test("sizes an icon key like the letters and spaces the keys as its slot does", async ({
    q,
  }) => {
    const box = q.article("Icon shortcut key");
    const slot = box.locator(".control-slot").filter({ hasText: "K" });
    const letter = query(box).text("K");
    const [iconBox, keyBox] = await Promise.all([
      getBox(slot.locator("svg")),
      getBox(letter),
    ]);
    // An icon key takes the font size of the keys. The page capture covers the
    // larger slot sizes, where the slot box no longer matches the letters.
    const fontSize = await letter.evaluate((node) =>
      Number.parseFloat(getComputedStyle(node).fontSize),
    );
    test.expect(iconBox.height).toBeCloseTo(fontSize, 0);
    const gap = await slot.evaluate((node) =>
      Number.parseFloat(getComputedStyle(node).columnGap),
    );
    test.expect(gap).toBeGreaterThan(0);
    test.expect(keyBox.x - iconBox.x - iconBox.width).toBeCloseTo(gap, 0);
  });

  // The page capture also keeps the static states of the button group fixture
  // under visual regression: joined borders, kept corners and the selected
  // surface.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972227948
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550181
  // https://github.com/ariakit/ariakit/issues/7466
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-button/page",
      }),
    );
  });

  test("shows the thick focus ring on keyboard focus @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Thick focus ring");
      const button = query(box).button("Move");
      await tabTo(page, button);
      await expectFocusVisible(button);
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-button/thick-focus-ring",
      });
    });
  });

  test("moves the segmented control selection to the clicked radio @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Segmented control");
      const grid = query(query(box).radiogroup("View")).radio("Grid");
      await grid.click();
      await test.expect(grid).toBeChecked();
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-button/segmented-control-click",
      });
    });
  });

  // Each layer sits next to the mid-lightness range that colors avoid. The
  // offset at rest turns the other way to avoid it, or the hover would enter
  // it, so a hover that kept the appearance-aware direction would go back to
  // the layer color. The state passes how it moves through the color alpha,
  // which each engine stores with its own precision, so this runs in every
  // engine.
  test("moves a lifted button further from a colored layer on hover", async ({
    page,
    q,
  }) => {
    await forEachColorScheme(page, async () => {
      const example = query(q.article("Lifted on colored layers"));
      for (const name of ["Vote", "Delete", "Retry"]) {
        const button = example.button(name);
        const rest = await getLightness(button);
        await hoverOver(button);
        await test.expect
          .poll(async () => (await getLightness(button)).surface)
          .not.toBe(rest.surface);
        const hovered = await getLightness(button);
        test.expect(hovered.parent).toBe(rest.parent);
        test
          .expect(Math.sign(hovered.surface - hovered.parent), name)
          .toBe(Math.sign(rest.surface - rest.parent));
        test
          .expect(Math.abs(hovered.surface - hovered.parent), name)
          .toBeGreaterThan(Math.abs(rest.surface - rest.parent));
      }
    });
  });

  test("shows the bar only beside the checked row of a vertical group", async ({
    q,
  }) => {
    const example = q.article("Vertical bar");
    const system = query(example).radio("System");
    const dark = query(example).radio("Dark");
    const systemBar = system.locator(".control-bar");
    const darkBar = dark.locator(".control-bar");
    await example.scrollIntoViewIfNeeded();
    await test.expect(system).toBeChecked();
    await test.expect(systemBar).toBeVisible();
    await test.expect(darkBar).toBeHidden();
    await dark.click();
    await test.expect(dark).toBeChecked();
    await test.expect(darkBar).toBeVisible();
    await test.expect(systemBar).toBeHidden();
  });

  // A hovered control owns both of its shared edges, so each one takes the
  // hovered surface instead of darkening where two borders overlap.
  // https://github.com/ariakit/ariakit/issues/7466
  for (const [key, title] of [
    ["horizontal", "Horizontal"],
    ["joined-vertical", "Joined vertical"],
  ] as const) {
    test(`tints both shared edges of the hovered middle control in ${title} @visual`, async ({
      page,
      q,
      visual,
    }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        const group = q.group(title);
        await hoverOver(query(group).button("Week"));
        await visual(
          getCapture(group, colorScheme, {
            item: `ariakit-ui-button/shared-edge-hover/${key}`,
          }),
        );
      });
    });
  }
});
