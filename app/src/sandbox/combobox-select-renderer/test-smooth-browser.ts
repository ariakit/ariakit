import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const renderer of ["ComboboxRenderer", "SelectRenderer"]) {
    test.describe(renderer, () => {
      test.beforeEach(async ({ q }) => {
        if (renderer === "SelectRenderer") {
          await q.button("Use SelectRenderer").click();
        }
      });

      // https://github.com/ariakit/ariakit/issues/7767
      test("keeps a far typeahead move in view after smooth scrolling", async ({
        page,
        q,
      }) => {
        await q.combobox("Smooth country").click();
        const list = q.listbox("Smooth country");
        await test.expect(list).not.toHaveAttribute("data-placing");
        await test.expect(list).toHaveCSS("scroll-behavior", "smooth");

        // Register before the key so even a short animation has an observer.
        await using scroll = await list.evaluateHandle((element) => ({
          end: new Promise<void>((resolve) => {
            element.addEventListener("scrollend", () => resolve(), {
              once: true,
            });
          }),
        }));
        await page.keyboard.press("u");
        const uganda = q.option("Uganda");
        await test.expect(uganda).toHaveAttribute("data-active-item");
        await scroll.evaluate(async ({ end }) => end);
        // The last scroll frame renders items, then their measurements commit
        // on the next frame. Neither step has a separate visible state.
        await flushFrames(page);
        await test.expect(uganda).toBeInViewport({ ratio: 0.9 });
      });
    });
  }
});
