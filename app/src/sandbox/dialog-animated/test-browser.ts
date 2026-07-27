import { withFramework } from "#app/test-utils/preview.ts";

function createTransition(duration = 100) {
  const then = performance.now();
  return () => performance.now() - then < duration;
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("show/hide preserves the leave transition", async ({ q }) => {
    const dialog = q.dialog("Success");
    const disclosure = q.button("Show modal");
    await test.expect(dialog).not.toBeVisible();

    await disclosure.click();
    await test.expect(dialog).toBeVisible();
    await test.expect(q.button("OK")).toBeFocused();

    const isLeaving = createTransition();
    await q.button("OK").click();
    await test.expect(disclosure).toBeFocused();
    if (isLeaving()) {
      await test.expect(dialog).toBeVisible();
    }
    await test.expect(dialog).not.toBeVisible();
  });
});
