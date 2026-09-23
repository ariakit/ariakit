import {
  captureInView,
  expectFocusVisible,
  expectMedia,
  forEachColorScheme,
  hoverOver,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { setVisonautItem } from "#app/test-utils/visonaut.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r4000661269
  test("keeps a filled control boundary in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/button/test-chrome-firefox/keeps-a-filled-control-boundary-in-forced-colors",
    );
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await captureInView(visual, q.article("Control surfaces"), colorScheme);
    });
  });

  // https://github.com/ariakit/ariakit/pull/7500#discussion_r4000661269
  test("keeps glider boundaries and inherited widths in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/button/test-chrome-firefox/keeps-glider-boundaries-and-inherited-widths-in-forced-colors",
    );
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await captureInView(visual, q.article("Glider"), colorScheme, {
        id: "joined",
      });
      const links = q.article("Current link gliders");
      await hoverOver(query(links).link("Activity"));
      await test
        .expect(links.locator(".glider:not(.selected):not(.focus)"))
        .toBeVisible();
      await captureInView(visual, links, colorScheme, { id: "hover" });
    });
  });

  // https://github.com/ariakit/ariakit/issues/7476
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r3995296714
  test("keeps disabled layers borderless and preserves bevels in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/button/test-chrome-firefox/keeps-disabled-layers-borderless-and-preserves-bevels-in-forced-colors",
    );
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await captureInView(visual, q.article("Layer disabled"), colorScheme);
    });
  });

  // https://github.com/ariakit/ariakit/issues/7476
  test("keeps filled and bevel button boundaries in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/button/test-chrome-firefox/keeps-filled-and-bevel-button-boundaries-in-forced-colors",
    );
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      for (const title of [
        "Default",
        "Lifted",
        "Pushed",
        "Contrast",
        "Desaturated",
        "Brand",
        "Bevel",
        "Inverted",
      ]) {
        await captureInView(visual, q.article(title), colorScheme, {
          id: title,
        });
      }
      const box = q.article("Thick focus ring");
      const button = query(box).button("Move");
      await tabTo(page, button);
      await expectFocusVisible(button);
      await captureInView(visual, box, colorScheme, { id: "focus" });
    });
  });

  // https://github.com/ariakit/ariakit/issues/7476
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r3996535606
  test("preserves explicit ring and inset button edges in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/button/test-chrome-firefox/preserves-explicit-ring-and-inset-button-edges-in-forced-colors",
    );
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await captureInView(visual, q.article("Ring borders"), colorScheme);
    });
  });
});
