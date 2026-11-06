import { withFramework } from "#app/test-utils/preview.ts";
import { expectAligned, selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1600, height: 900 } });

  // Chromium is the only desktop project that can emulate a safe area. The
  // preview page doesn't cover the safe area until it sets `viewport-fit`. The
  // left inset is wider than the 160px page space beside the 80rem box, and the
  // right one is empty, so the area moves if a side takes the wrong inset.
  for (const rtl of [false, true]) {
    test(`lines up an area in the inner header with a wide safe area in ${rtl ? "RTL" : "LTR"}`, async ({
      page,
      q,
    }) => {
      const session = await page.context().newCDPSession(page);
      await session.send("Emulation.setSafeAreaInsetsOverride", {
        insets: { top: 0, bottom: 0, left: 200, right: 0 },
      });
      await page.evaluate(() => {
        document
          .querySelector('meta[name="viewport"]')
          ?.setAttribute("content", "width=device-width,viewport-fit=cover");
      });
      await selectScenario(q, "page");
      await q.checkbox("Right to left").setChecked(rtl);
      await q.checkbox("Inner header").check();
      await expectAligned(q.group("Inner header area"), q.group("Body column"));
    });
  }
});
