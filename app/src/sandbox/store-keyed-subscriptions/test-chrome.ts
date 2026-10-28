import { gotoAndSettle, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("hydrates deterministic selector counters", async ({ page, q }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        hydrationErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => hydrationErrors.push(error.message));

    // Re-navigate with listeners attached to capture errors from hydration.
    await gotoAndSettle(page, page.url());

    await test.expect(q.status("useStoreState calls")).not.toHaveText("0");
    await test
      .expect(q.status("useStoreStateObject calls"))
      .not.toHaveText("0");
    // https://github.com/ariakit/ariakit/issues/7240
    await test.expect(q.status("Sparse selector values")).toHaveText("0:0");
    test.expect(hydrationErrors).toEqual([]);
  });
});
