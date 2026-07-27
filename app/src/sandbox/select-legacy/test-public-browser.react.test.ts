import { withFramework } from "#app/test-utils/preview.ts";
import { checkLegacyAnimatedSelects } from "./public-tests/animated-browser-case.react.test.ts";
import { checkLegacySelectComboboxOffscreenLayout } from "./public-tests/offscreen-browser-case.react.test.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("preserves animated and offscreen legacy Select behavior", async ({
    page,
  }) => {
    const showCase = async (caseName: string) => {
      await page
        .getByRole("button", { name: `Show ${caseName}`, exact: true })
        .click();
    };

    await checkLegacyAnimatedSelects(page, showCase);
    await checkLegacySelectComboboxOffscreenLayout(page, showCase);
  });
});
