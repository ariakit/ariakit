import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox, selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // Chromium is the only desktop project that can emulate a safe area. The
  // preview page doesn't cover the safe area until it sets `viewport-fit`.
  for (const [left, right] of [
    [60, 0],
    [60, 20],
    [0, 60],
  ] as const) {
    for (const rtl of [false, true]) {
      test(`aligns areas with unequal safe areas of ${left}px and ${right}px in ${rtl ? "RTL" : "LTR"}`, async ({
        page,
        q,
      }) => {
        const session = await page.context().newCDPSession(page);
        await session.send("Emulation.setSafeAreaInsetsOverride", {
          insets: { top: 0, bottom: 0, left, right },
        });
        await page.evaluate(() => {
          document
            .querySelector('meta[name="viewport"]')
            ?.setAttribute("content", "width=device-width,viewport-fit=cover");
        });
        await selectScenario(q, "areas");
        await q.checkbox("Right to left").setChecked(rtl);
        const header = page.locator(".shell-header");
        await expect(header).toHaveCSS(
          "padding-left",
          `${Math.max(left, 11)}px`,
        );
        await expect(header).toHaveCSS(
          "padding-right",
          `${Math.max(right, 11)}px`,
        );
        const area = q.group("Header area");
        const body = q.group("Body band");
        await expect
          .poll(async () => {
            const [areaBox, bodyBox] = await Promise.all([
              getBox(area),
              getBox(body),
            ]);
            return Math.abs(areaBox.x - bodyBox.x);
          })
          .toBeLessThan(0.5);
      });
    }
  }
});
