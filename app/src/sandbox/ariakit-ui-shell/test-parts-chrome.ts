import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox, selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ q }) => {
    await selectScenario(q, "parts");
  });

  test("keeps the introduction and local header in one main landmark", async ({
    q,
    page,
  }) => {
    await expect(q.main()).toHaveCount(1);
    await expect(q.main().locator("h1")).toHaveText("Explicit shell parts");
    await expect(q.main().locator(":scope > header")).toHaveText(
      "Page actions",
    );
    await expect(q.banner()).toHaveCount(1);
    await expect(q.contentinfo()).toHaveCount(0);
    await expect(q.main()).toHaveCSS("container-type", "normal");
    await expect(q.main()).toHaveCSS("overflow", "visible");
    await expect(page.locator(".shell-main").first()).toHaveCSS(
      "grid-template-rows",
      /subgrid/,
    );
  });

  test("preserves local percentage and length maximum widths", async ({
    q,
    page,
  }) => {
    const intro = page.locator(".shell-main-intro");
    const width = (await getBox(intro)).width;
    const cases = [
      ["50%", width / 2],
      ["calc(100% - 10rem)", width - 160],
      ["min(40rem, 80%)", Math.min(640, width * 0.8)],
      ["20rem", 320],
    ] as const;
    for (const [value, expected] of cases) {
      await q.combobox("Intro maximum width").selectOption(value);
      await expect
        .poll(
          async () => (await getBox(q.heading("Explicit shell parts"))).width,
        )
        .toBeCloseTo(expected, 0);
      expect((await getBox(q.region("Main content"))).width).toBeCloseTo(
        480,
        0,
      );
      expect(
        (await getBox(page.locator('[aria-label="Main actions"]'))).width,
      ).toBeCloseTo(480, 0);
    }
  });
});
