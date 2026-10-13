import { expect } from "@playwright/test";
import type { PerfHelpers } from "#app/test-utils/fixtures.ts";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const itemCount = 10000;

async function configure({ q }: PerfHelpers, mode: string) {
  await q.combobox("Item count").selectOption(String(itemCount));
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
  for (const mode of ["fixed", "measured", "grouped"]) {
    test.describe(`${itemCount} items, ${mode}`, () => {
      const setup = async (helpers: PerfHelpers) => {
        await configure(helpers, mode);
        await open(helpers);
      };

      test("open at a far selected item", async ({ perf }) => {
        const target = `Target ${itemCount * 0.8}`;
        await perf.measure((helpers) => open(helpers, target), {
          setup: async (helpers) => {
            await configure(helpers, mode);
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
                far ? `Target ${itemCount * 0.8}` : "Item 1",
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
            await input.fill(`Item ${itemCount}`);
            await expect(helpers.q.status("Matching items")).toHaveText("1");
            await expectActiveInView(helpers, `Item ${itemCount}`);
            await input.fill("");
            await expect(helpers.q.status("Matching items")).toHaveText(
              String(itemCount),
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
    });
  }
});
