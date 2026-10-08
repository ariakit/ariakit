import { expect } from "@playwright/test";
import type { PerfHelpers } from "#app/test-utils/fixtures.ts";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

async function configure({ q }: PerfHelpers, count: number, mode: string) {
  await q.combobox("Item count").selectOption(String(count));
  await q.combobox("Layout").selectOption(mode);
  await expect(q.combobox("Choice")).toHaveText("Item 1");
}

async function expectActiveInView({ page, q }: PerfHelpers, value: string) {
  const option = q.option(value, { exact: true });
  await expect(option).toHaveAttribute("data-active-item");
  // An estimated offset can show the active item before measurements move it
  // again. Cross the scroll-task frame and the following measurement frame.
  await flushFrames(page);
  await expect(option).toBeInViewport({ ratio: 0.99 });
}

async function open(helpers: PerfHelpers, value = "Item 1") {
  await helpers.q.combobox("Choice").click();
  await expect(helpers.q.listbox("Choices")).toBeVisible();
  await expectActiveInView(helpers, value);
}

withFramework(import.meta.dirname, async ({ test }) => {
  for (const count of [1000, 10000]) {
    for (const mode of ["fixed", "measured", "grouped"]) {
      test.describe(`${count} items, ${mode}`, () => {
        const setup = async (helpers: PerfHelpers) => {
          await configure(helpers, count, mode);
          await open(helpers);
        };

        test("open at a far selected item", async ({ perf }) => {
          const target = `Target ${count * 0.8}`;
          await perf.measure((helpers) => open(helpers, target), {
            setup: async (helpers) => {
              await configure(helpers, count, mode);
              await helpers.q.combobox("Choice").focus();
              await helpers.page.keyboard.press("t");
              await expect(helpers.q.combobox("Choice")).toHaveText(target);
            },
          });
        });

        test("move to far items", async ({ perf }) => {
          await perf.measure(
            async (helpers) => {
              for (let index = 0; index < 6; index += 1) {
                const far = index % 2 === 0;
                await helpers.page.keyboard.press(far ? "t" : "Home");
                await expectActiveInView(
                  helpers,
                  far ? `Target ${count * 0.8}` : "Item 1",
                );
              }
            },
            { setup },
          );
        });

        test("filter and restore items", async ({ perf }) => {
          await perf.measure(
            async (helpers) => {
              const input = helpers.q.combobox("Search items");
              await input.fill(`Item ${count}`);
              await expect(helpers.q.status("Matching items")).toHaveText("1");
              await expectActiveInView(helpers, `Item ${count}`);
              await input.fill("");
              await expect(helpers.q.status("Matching items")).toHaveText(
                String(count),
              );
              await expectActiveInView(helpers, "Item 1");
            },
            {
              setup: async (helpers) => {
                await helpers.q.checkbox("Searchable").check();
                await setup(helpers);
                await expect(helpers.q.combobox("Search items")).toBeFocused();
              },
            },
          );
        });

        test("select a different item and reopen", async ({ perf }) => {
          await perf.measure(
            async (helpers) => {
              await helpers.page.keyboard.press("ArrowDown");
              await expectActiveInView(helpers, "Item 2");
              await helpers.page.keyboard.press("Enter");
              await expect(helpers.q.combobox("Choice")).toHaveText("Item 2");
              await expect(helpers.q.listbox("Choices")).toHaveCount(0);
              await helpers.q.combobox("Choice").click();
              await expectActiveInView(helpers, "Item 2");
            },
            { setup },
          );
        });
      });
    }
  }
});
