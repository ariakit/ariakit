import {
  captureInView,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { setVisonautItem } from "#app/test-utils/visonaut.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r3997273277
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r4000461790
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r4000913151
  test("keeps unselected tabs borderless in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/tabs/test-chrome-firefox/keeps-unselected-tabs-borderless-in-forced-colors",
    );
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      for (const title of [
        "Flat tabs",
        "Bevel tabs",
        "Flat glider",
        "Bevel glider",
        "Borderless flat glider",
        "Borderless bevel glider",
      ]) {
        const box = q.article(title);
        const selected = query(box).tab("Usage");
        await selected.click();
        await query(box).heading(title).click();
        await test.expect(selected).toHaveAttribute("aria-selected", "true");
        await captureInView(visual, box, colorScheme, { id: title });
      }
    });
  });
});
