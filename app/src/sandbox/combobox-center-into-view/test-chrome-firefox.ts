import { withFramework } from "#app/test-utils/preview.ts";
import {
  getPageScrolls,
  recordPageScrolls,
} from "./page-scroll.test-helper.ts";

// The popup that unmounts while hidden has no popover element until it opens,
// so this exercises the presentation pass against one created during the very
// open it has to present into. Safari is excluded because there its selected
// item is still off screen when `redirectFocusToBaseElement` reaches it there,
// and that fallback scrolls the document for its own reasons before restoring
// it.
withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6994
  test("centers without scrolling the page after remounting", async ({
    page,
    q,
  }) => {
    const label = "Unmounted select-only fruit";
    const select = q.combobox(label);

    await page.evaluate(() => window.scrollTo({ top: 200 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(200);
    // Hovering first so the click doesn't have to scroll the select into view,
    // which would land inside the recording below.
    await select.hover();
    await recordPageScrolls(page);

    await select.click();

    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    const listbox = q.listbox(`${label} options`);
    await test.expect
      .poll(() => listbox.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    test.expect(await getPageScrolls(page)).toEqual([]);
    test.expect(await page.evaluate(() => window.scrollY)).toBe(200);
  });
});
