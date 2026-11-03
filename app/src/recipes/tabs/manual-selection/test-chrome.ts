import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("moves focus without loading until a tab is selected", async ({
    q,
    page,
  }) => {
    await q.tab("Sales").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Traffic")).toBeFocused();
    await test.expect(q.tab("Sales")).toHaveAttribute("aria-selected", "true");
    await test
      .expect(q.tabpanel("Sales"))
      .toHaveAttribute("aria-busy", "false");

    await page.keyboard.press("Enter");
    await test
      .expect(q.tabpanel("Traffic"))
      .toHaveAttribute("aria-busy", "true");
    await test
      .expect(q.tabpanel("Traffic"))
      .toHaveAttribute("aria-busy", "false");
    await test
      .expect(q.tabpanel("Traffic"))
      .toHaveText("Traffic from search doubled since March.");
  });
});
