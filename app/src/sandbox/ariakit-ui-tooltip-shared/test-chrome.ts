import { withFramework } from "#app/test-utils/preview.ts";
import { hoverAnchor, waitPastSlide } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("doesn't slide with $slide set to false", async ({ page, q }) => {
    const section = q.region("No slide");
    await hoverAnchor(query(section).button("One"));
    await test.expect(q.tooltip("One tooltip")).toBeVisible();
    await query(section).button("Two").hover();
    await test.expect(q.tooltip("Two tooltip")).toBeVisible();
    await waitPastSlide(page);
    await test.expect(query(section).status()).toHaveText("Slides: 0");
  });

  test("doesn't slide with reduced motion", async ({ page, q }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const section = q.region("Slide");
    await hoverAnchor(query(section).button("One"));
    await test.expect(q.tooltip("One tooltip")).toBeVisible();
    await query(section).button("Two").hover();
    await test.expect(q.tooltip("Two tooltip")).toBeVisible();
    await waitPastSlide(page);
    await test.expect(query(section).status()).toHaveText("Slides: 0");
  });
});
