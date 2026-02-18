import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getContent(button: Locator) {
  const contentId = await button.getAttribute("aria-controls");
  return button.page().locator(`[id="${contentId}"]`);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("open @visual", async ({ q, visual }) => {
    await q.button("Handling User Interactions and Side Effects").click();
    await test
      .expect(q.text("To improve usability, the dropdown"))
      .toBeVisible();
    await q.button("Ensuring Accessibility and Semantics").click();
    const content = await getContent(q.button("Thoughts"));
    await test.expect
      .poll(() =>
        content.evaluate((element) => {
          element.scrollTop = element.scrollHeight;
          return Math.abs(
            element.scrollHeight - element.clientHeight - element.scrollTop,
          );
        }),
      )
      .toBeLessThan(2);
    await visual();
  });
});
