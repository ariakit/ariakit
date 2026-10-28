import { getBackgroundContrast } from "#app/test-utils/contrast.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // The fill of a checked radio is its boundary, so it keeps 3:1 against the
  // brand surface around it, as WCAG 1.4.11 asks for the state of a control.
  // https://github.com/ariakit/ariakit/issues/8080
  test("keeps a checked radio at 3:1 against a brand layer", async ({
    page,
    q,
  }) => {
    const radio = query(q.article("Group on a brand layer")).radio("Pro");
    for (const colorScheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme });
      await test.expect(radio).toBeChecked();
      await test.expect
        .poll(() => getBackgroundContrast(radio), {
          message: colorScheme,
        })
        .toBeGreaterThanOrEqual(3);
    }
  });
});
