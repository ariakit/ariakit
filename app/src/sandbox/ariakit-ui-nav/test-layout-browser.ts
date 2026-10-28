import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox } from "../ariakit-ui-shell/test-helpers.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const rtl of [false, true]) {
    test(`keeps links and the bar in one scrolling row${rtl ? " in RTL" : ""}`, async ({
      q,
      page,
    }) => {
      if (rtl) await q.checkbox("Right to left").check();
      const nav = q.navigation("Project pages");
      const links = query(nav).link();
      expect(
        await nav.evaluate((node) => node.scrollWidth > node.clientWidth),
      ).toBe(true);
      await expect(nav.locator("ul")).toHaveCSS("display", "contents");
      for (const item of await nav.locator("li").all()) {
        await expect(item).toHaveCSS("display", "contents");
      }
      await links.first().focus();
      for (const link of (await links.all()).slice(1)) {
        await page.keyboard.press("Tab");
        await expect(link).toBeFocused();
        const box = await getBox(link);
        const bounds = await getBox(nav);
        expect(box.x).toBeGreaterThanOrEqual(bounds.x - 1);
        expect(box.x + box.width).toBeLessThanOrEqual(
          bounds.x + bounds.width + 1,
        );
      }
      await page.keyboard.press("Enter");
      await expect(links.last()).toHaveAttribute("aria-current", "step");
      const bar = nav.locator(".control-bar:visible");
      await expect
        .poll(async () => {
          const [marker, item] = await Promise.all([
            getBox(bar),
            getBox(links.last()),
          ]);
          // The bar is shorter than the link by its corner radius.
          return marker.x + marker.width / 2 - item.x - item.width / 2;
        })
        .toBeCloseTo(0, 0);
      await q.combobox("Bar distance").selectOption("edge");
      await expect
        .poll(async () => {
          const [marker, frame] = await Promise.all([getBox(bar), getBox(nav)]);
          return marker.y + marker.height - frame.y - frame.height;
        })
        .toBeCloseTo(0, 0);
      await nav.evaluate((node, rtl) => {
        node.scrollLeft += rtl ? 36 : -36;
      }, rtl);
      await page.evaluate(() => window.scrollBy(0, 20));
      await expect
        .poll(async () => {
          const [marker, item] = await Promise.all([
            getBox(bar),
            getBox(links.last()),
          ]);
          // The bar is shorter than the link by its corner radius.
          return marker.x + marker.width / 2 - item.x - item.width / 2;
        })
        .toBeCloseTo(0, 0);
      await expect
        .poll(async () => {
          const [box, bounds] = await Promise.all([getBox(bar), getBox(nav)]);
          return box.y + box.height - bounds.y - bounds.height;
        })
        .toBeCloseTo(0, 0);
      const top = (await getBox(links.first())).y;
      for (const link of await links.all()) {
        expect((await getBox(link)).y).toBeCloseTo(top, 0);
      }
    });
  }
});
