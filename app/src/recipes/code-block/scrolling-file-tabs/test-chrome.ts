import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("scrolls the file tabs with a button and keeps focus on the tab", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const list = q.tablist("Files");
    const selected = q.tab("todo-app.tsx");
    await selected.click();
    await test.expect(q.button("Previous tabs")).toBeHidden();
    // The buttons follow the tab list in the Tab order, before the code.
    await page.keyboard.press("Tab");
    await test.expect(q.button("Next tabs")).toBeFocused();
    await selected.focus();
    await q.button("Next tabs").click();
    await test.expect
      .poll(() => list.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
    await test.expect(selected).toBeFocused();
    await test.expect(q.button("Previous tabs")).toBeVisible();
  });

  test("scrolls the tab that the keyboard selects into view", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const last = q.tab("todos.json");
    await test.expect(last).not.toBeInViewport({ ratio: 1 });
    await q.tab("todo-app.tsx").click();
    await page.keyboard.press("End");
    await test.expect(last).toBeFocused();
    await test.expect(last).toBeInViewport({ ratio: 1 });
    await test.expect(q.tabpanel("todos.json")).toBeVisible();
  });
});
