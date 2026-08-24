import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const renderer of ["ComboboxRenderer", "SelectRenderer"]) {
    test.describe(renderer, () => {
      test.beforeEach(async ({ q }) => {
        if (renderer === "SelectRenderer") {
          await q.button("Use SelectRenderer").click();
        }
      });

      // https://github.com/ariakit/ariakit/issues/7114
      test("selects a mounted automatic range without selectable item data", async ({
        q,
      }) => {
        await q.option("Range alpha").click();
        await q.option("Range gamma").click({ modifiers: ["Shift"] });

        await test
          .expect(q.option("Range alpha"))
          .toHaveAttribute("aria-selected", "true");
        await test
          .expect(q.option("Range beta"))
          .toHaveAttribute("aria-selected", "true");
        await test
          .expect(q.option("Range unavailable"))
          .not.toHaveAttribute("aria-selected", "true");
        await test
          .expect(q.option("Range gamma"))
          .toHaveAttribute("aria-selected", "true");
        await test
          .expect(q.status("Automatic renderer selection"))
          .toHaveText("Range alpha, Range beta, Range gamma");
      });
    });
  }
});
