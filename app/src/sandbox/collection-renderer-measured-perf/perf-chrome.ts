import { expect } from "@playwright/test";
import type { PerfHelpers } from "#app/test-utils/fixtures.ts";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

async function configure({ page, q }: PerfHelpers, count: number) {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await q.combobox("Item count").selectOption(String(count));
}

async function mount({ q }: PerfHelpers) {
  await q.button("Mount collection").click();
  await expect(q.listitem("Item 6", { exact: true })).toBeInViewport({
    ratio: 0.99,
  });
}

async function scrollWindow({ page, q }: PerfHelpers, far: boolean) {
  await q.region("Measured viewport").evaluate((element, distant) => {
    element.scrollTop = distant ? element.scrollHeight * 0.8 : 0;
  }, far);
  await expect(q.listitem("Item 1", { exact: true })).toHaveCount(far ? 0 : 1);
  // The scroll task renders a new window, then ResizeObserver measures its
  // rows. Check visibility after those frames, including any new estimates.
  await flushFrames(page);
  await expect(q.listitem().nth(2)).toBeInViewport({ ratio: 0.99 });
}

withFramework(import.meta.dirname, async ({ test }) => {
  for (const count of [1000, 10000]) {
    test.describe(`${count} items`, () => {
      const setup = async (helpers: PerfHelpers) => {
        await configure(helpers, count);
        await mount(helpers);
      };

      test("mount measured items", async ({ perf }) => {
        await perf.measure(mount, {
          setup: (helpers) => configure(helpers, count),
        });
      });

      test("scroll measured items", async ({ perf }) => {
        await perf.measure(
          async (helpers) => {
            for (let index = 0; index < 10; index += 1) {
              await scrollWindow(helpers, index % 2 === 0);
            }
          },
          { setup },
        );
      });

      test("resize the viewport", async ({ perf }) => {
        await perf.measure(
          async ({ q }) => {
            for (let index = 0; index < 10; index += 1) {
              const large = index % 2 === 0;
              await q.checkbox("Larger viewport").setChecked(large);
              const item = q.listitem("Item 12", { exact: true });
              if (large) {
                await expect(item).toBeInViewport({ ratio: 0.99 });
              } else {
                await expect(item).toHaveCount(0);
              }
            }
          },
          { setup },
        );
      });

      test("resize measured items", async ({ perf }) => {
        await perf.measure(
          async (helpers) => {
            for (let index = 0; index < 10; index += 1) {
              const large = index % 2 === 0;
              await helpers.q.checkbox("Taller items").setChecked(large);
              // The second row's offset changes only after the renderer has
              // measured the first row's new height and committed new
              // positions.
              await expect
                .poll(async () => {
                  return helpers.q
                    .listitem("Item 2", { exact: true })
                    .evaluate((element) =>
                      Number.parseFloat(element.style.top),
                    );
                })
                .toBeCloseTo(large ? 48.4 : 24.4, 1);
            }
          },
          { setup },
        );
      });
    });
  }
});
