import { withFramework } from "#app/test-utils/preview.ts";
import { largestStyleRecalculation } from "#app/test-utils/style.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/8026
  // A Chromium bug can make some page loads restyle the whole main content, so
  // this test can fail intermittently until it is fixed.
  // https://github.com/ariakit/ariakit/issues/8084
  // https://issues.chromium.org/issues/577199085
  test("keeps main content styles cached when a sidebar closes and opens", async ({
    page,
    q,
  }) => {
    const toggle = q.button("Toggle sidebar");
    const sidebar = q.navigation("Documentation");
    const contentCount = await q.main().locator("*").count();
    const closing = await largestStyleRecalculation(page, () => toggle.click());
    await test.expect(sidebar).toBeHidden();
    const opening = await largestStyleRecalculation(page, () => toggle.click());
    await test.expect(sidebar).toBeVisible();
    test.expect(closing).toBeLessThan(contentCount);
    test.expect(opening).toBeLessThan(contentCount);
  });

  test("keeps content area styles cached when a sidebar closes and opens", async ({
    page,
    q,
  }) => {
    await q.combobox("Scenario").selectOption("areas");
    const toggle = q.checkbox("Start sidebar");
    const sidebar = q.navigation("Start sidebar");
    // Below either area's count. The trace can miss a value that only inherits
    // into a bar, so the checks below compare the values themselves.
    const areaCount = Math.min(
      await page.locator('[aria-label="Header area"] *').count(),
      await page.locator('[aria-label="Main header area"] *').count(),
    );
    const readCustomProperties = (name: string) =>
      q
        .group(name)
        .locator("> div")
        .evaluate((element) => {
          const entries: Array<[string, string]> = [];
          for (const [property, values] of element.computedStyleMap()) {
            if (!property.startsWith("--")) continue;
            entries.push([property, Array.from(values, String).join(" ")]);
          }
          return Object.fromEntries(entries);
        });
    const headerValues = await readCustomProperties("Header area");
    const mainHeaderValues = await readCustomProperties("Main header area");
    const closing = await largestStyleRecalculation(page, () =>
      toggle.uncheck(),
    );
    await test.expect(sidebar).toBeHidden();
    test
      .expect(await readCustomProperties("Header area"))
      .toEqual(headerValues);
    test
      .expect(await readCustomProperties("Main header area"))
      .toEqual(mainHeaderValues);
    const opening = await largestStyleRecalculation(page, () => toggle.check());
    await test.expect(sidebar).toBeVisible();
    test.expect(closing).toBeLessThan(areaCount);
    test.expect(opening).toBeLessThan(areaCount);
  });

  test("keeps the header area styles cached when a sidebar in the page box closes and opens", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await q.combobox("Scenario").selectOption("page");
    const toggle = q.checkbox("Start sidebar");
    const sidebar = q.navigation("Start sidebar");
    const area = q.group("Header area");
    const areaCount = await area.locator("*").count();
    const readCustomProperties = () =>
      q.group("Area center").evaluate((element) => {
        const entries: Array<[string, string]> = [];
        for (const [property, values] of element.computedStyleMap()) {
          if (!property.startsWith("--")) continue;
          entries.push([property, Array.from(values, String).join(" ")]);
        }
        return Object.fromEntries(entries);
      });
    const values = await readCustomProperties();
    const closing = await largestStyleRecalculation(page, () =>
      toggle.uncheck(),
    );
    await test.expect(sidebar).toBeHidden();
    test.expect(await readCustomProperties()).toEqual(values);
    const opening = await largestStyleRecalculation(page, () => toggle.check());
    await test.expect(sidebar).toBeVisible();
    test.expect(closing).toBeLessThan(areaCount);
    test.expect(opening).toBeLessThan(areaCount);
  });
});
