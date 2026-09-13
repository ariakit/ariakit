import { resolve } from "node:path";
import { capturePage, withCaptures } from "#app/test-utils/ariakit-ui.ts";

for (const sandbox of ["badge", "table"]) {
  const dirname = resolve(
    import.meta.dirname,
    `../sandbox/ariakit-ui-${sandbox}`,
  );
  withCaptures(dirname, async ({ test }) => {
    test(`${sandbox} page captures cover every example once`, async ({
      page,
      q,
    }) => {
      const main = q.main();
      const boxes = main.locator(":scope > article");
      const titles = await boxes.locator(":scope > header").allTextContents();
      const capturedTitles: string[] = [];
      let captures = 0;

      await capturePage(
        page,
        async ({ element, id, fullPage, viewports }) => {
          test.expect(fullPage).toBe(true);
          test.expect(viewports?.desktop?.width).toBe(1920);
          test.expect(element).toBeDefined();
          test.expect(typeof element).not.toBe("string");
          if (!element || typeof element === "string") return;
          const capturedBoxes =
            sandbox === "badge" ? element.locator(":scope > article") : element;
          if (sandbox === "badge") {
            test.expect(id).toBeUndefined();
            test
              .expect(await element.evaluate((node) => node.tagName))
              .toBe("MAIN");
          } else {
            test.expect(id).toMatch(/^rows-\d+-\d+$/);
            const rows = await capturedBoxes.evaluateAll(
              (elements) =>
                new Set(
                  elements.map((node) => node.getBoundingClientRect().top),
                ).size,
            );
            test.expect(rows).toBeGreaterThan(0);
            test.expect(rows).toBeLessThanOrEqual(3);
          }
          capturedTitles.push(
            ...(await capturedBoxes
              .locator(":scope > header")
              .allTextContents()),
          );
          captures += 1;
        },
        "light",
      );

      test.expect(capturedTitles).toEqual(titles);
      if (sandbox === "badge") {
        test.expect(captures).toBe(1);
      } else {
        test.expect(captures).toBeGreaterThan(1);
      }
    });
  });
}
