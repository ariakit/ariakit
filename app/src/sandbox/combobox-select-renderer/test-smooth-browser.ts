import type { Locator } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

function observeScroll(list: Locator) {
  return list.evaluateHandle((element) => ({
    start: new Promise<void>((resolve) => {
      element.addEventListener("scroll", () => resolve(), { once: true });
    }),
    end: new Promise<void>((resolve) => {
      if (Reflect.has(element, "onscrollend")) {
        element.addEventListener("scrollend", () => resolve(), { once: true });
      } else {
        let timeout = 0;
        const onScroll = () => {
          clearTimeout(timeout);
          // Cross the renderer's 100 ms idle correction and any resulting
          // scroll before a negative viewport assertion can pass.
          timeout = window.setTimeout(() => {
            element.removeEventListener("scroll", onScroll);
            resolve();
          }, 200);
        };
        element.addEventListener("scroll", onScroll);
      }
    }),
  }));
}

withFramework(import.meta.dirname, async ({ test }) => {
  for (const scrollEnd of [true, false]) {
    for (const renderer of ["ComboboxRenderer", "SelectRenderer"]) {
      test.describe(`${renderer} ${scrollEnd ? "with" : "without"} scrollend`, () => {
        test.beforeEach(async ({ page, q }) => {
          if (!scrollEnd) {
            // Keep native smooth scrolling but simulate engines without the
            // scrollend capability, such as Safari before 26.2.
            await page.evaluate(() => {
              for (const target of [
                window,
                document,
                document.documentElement,
              ]) {
                let prototype = target;
                while (prototype) {
                  Reflect.deleteProperty(prototype, "onscrollend");
                  prototype = Object.getPrototypeOf(prototype);
                }
              }
              window.addEventListener(
                "scrollend",
                (event) => event.stopImmediatePropagation(),
                true,
              );
            });
          }
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
          await using scroll = await observeScroll(list);
          await page.keyboard.press("u");
          const uganda = q.option("Uganda");
          await test.expect(uganda).toHaveAttribute("data-active-item");
          await scroll.evaluate(async ({ end }) => end);
          // The last scroll frame renders items, then their measurements commit
          // on the next frame. Neither step has a separate visible state.
          await flushFrames(page);
          await test.expect(uganda).toBeInViewport({ ratio: 0.9 });
        });

        test("keeps a far upward move in view after smooth scrolling", async ({
          page,
          q,
        }) => {
          await q.combobox("Smooth country").click();
          const list = q.listbox("Smooth country");
          await test.expect(list).not.toHaveAttribute("data-placing");
          await using down = await observeScroll(list);
          await page.keyboard.press("End");
          await test
            .expect(q.option("Zambia"))
            .toHaveAttribute("data-active-item");
          await down.evaluate(async ({ end }) => end);
          // The final scroll frame must render and measure before moving
          // upward.
          await flushFrames(page);

          await using up = await observeScroll(list);
          await page.keyboard.press("d");
          const denmark = q.option("Denmark");
          await test.expect(denmark).toHaveAttribute("data-active-item");
          await up.evaluate(async ({ end }) => end);
          // Scroll completion precedes the final renderer measurements.
          await flushFrames(page);
          await test.expect(denmark).toBeInViewport({ ratio: 0.9 });
        });

        test("honors a newer keyboard move during smooth scrolling", async ({
          page,
          q,
        }) => {
          await q.combobox("Smooth country").click();
          const list = q.listbox("Smooth country");
          await test.expect(list).not.toHaveAttribute("data-placing");
          await using scroll = await observeScroll(list);
          await page.keyboard.press("u");
          await scroll.evaluate(async ({ start }) => start);
          await page.keyboard.press("Home");
          const argentina = q.option("Argentina");
          await test.expect(argentina).toHaveAttribute("data-active-item");
          await scroll.evaluate(async ({ end }) => end);
          // The superseded move must finish its final render and measurements.
          await flushFrames(page);
          await test.expect(argentina).toBeInViewport({ ratio: 0.9 });
        });

        for (const gesture of ["wheel", "touchmove"]) {
          // https://github.com/ariakit/ariakit/pull/7837#discussion_r4239950657
          test(`keeps a repeated move in view after ${gesture}`, async ({
            page,
            q,
          }) => {
            await q.combobox("Smooth country").click();
            const list = q.listbox("Smooth country");
            await test.expect(list).not.toHaveAttribute("data-placing");
            await using down = await observeScroll(list);
            await page.keyboard.press("End");
            const zambia = q.option("Zambia");
            await test.expect(zambia).toHaveAttribute("data-active-item");
            await down.evaluate(async ({ end }) => end);
            // Scroll completion precedes the final renderer measurements.
            await flushFrames(page);
            await test.expect(zambia).toBeInViewport({ ratio: 0.9 });

            await using up = await observeScroll(list);
            // Desktop projects do not share native touch input. Send the
            // gesture event and scroll to the top without changing the active
            // item.
            await list.evaluate((element, gesture) => {
              element.dispatchEvent(new Event(gesture, { bubbles: true }));
              element.scrollTo({ top: 0, behavior: "instant" });
            }, gesture);
            await up.evaluate(async ({ end }) => end);
            // The newly visible rows must be measured before the next move.
            await flushFrames(page);
            await test.expect(zambia).toHaveAttribute("data-active-item");
            await test.expect(zambia).not.toBeInViewport();

            await using again = await observeScroll(list);
            await page.keyboard.press("End");
            await again.evaluate(async ({ end }) => end);
            // Scroll completion precedes the final renderer measurements.
            await flushFrames(page);
            await test.expect(zambia).toHaveAttribute("data-active-item");
            await test.expect(zambia).toBeInViewport({ ratio: 0.9 });
          });
        }

        test("lets a scrollbar drag interrupt smooth scrolling", async ({
          page,
          q,
        }) => {
          await q.combobox("Smooth country").click();
          const list = q.listbox("Smooth country");
          await test.expect(list).not.toHaveAttribute("data-placing");
          await using scroll = await observeScroll(list);
          await page.keyboard.press("u");
          const uganda = q.option("Uganda");
          await test.expect(uganda).toHaveAttribute("data-active-item");
          await scroll.evaluate(async ({ start }) => start);
          // Scrollbars differ across the test platforms. Dispatch the pointer
          // event and set the offset to reproduce a scrollbar drag to the top.
          await list.evaluate((element) => {
            element.dispatchEvent(
              new PointerEvent("pointerdown", { bubbles: true }),
            );
            element.scrollTo({ top: 0, behavior: "instant" });
          });
          await scroll.evaluate(async ({ end }) => end);
          // A late measurement could reveal the item again, so cross its frames
          // before asserting that the item stays outside the viewport.
          await flushFrames(page);
          await test.expect(uganda).toHaveAttribute("data-active-item");
          await test.expect(uganda).not.toBeInViewport();
        });

        test("does not turn an already visible keyboard target into a later scroll correction", async ({
          page,
          q,
        }) => {
          await q.combobox("Smooth country").click();
          const list = q.listbox("Smooth country");
          await test.expect(list).not.toHaveAttribute("data-placing");
          await page.keyboard.press("Home");
          const argentina = q.option("Argentina");
          await test.expect(argentina).toHaveAttribute("data-active-item");
          await test.expect(argentina).toBeInViewport({ ratio: 0.9 });

          await using scroll = await observeScroll(list);
          // This application scroll has no gesture that would release the
          // active item. The preceding no-op keyboard scroll must be finished.
          await list.evaluate((element) => element.scrollTo({ top: 1000 }));
          await scroll.evaluate(async ({ end }) => end);
          // A stale correction could reveal the item during the final render
          // and measurement frames, after the native scrollend event.
          await flushFrames(page);
          await test.expect(argentina).not.toBeInViewport();
          test
            .expect(await list.evaluate((element) => element.scrollTop))
            .toBeGreaterThan(0);
        });
      });
    }
  }
});
