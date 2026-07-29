import type { Page } from "@ariakit/test/playwright";
import { withFramework } from "#app/test-utils/preview.ts";

function pressTab(page: Page, browserName: string) {
  const key = browserName === "webkit" ? "Alt+Tab" : "Tab";
  return page.keyboard.press(key);
}

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6868
  test("tabs to a non-scrollable list with real focus", async ({
    page,
    q,
    browserName,
  }) => {
    await q.combobox("Real focus fruit").click();
    const input = q.combobox("Search Real focus fruit");
    const list = q.listbox("Real focus fruit");
    await test.expect(input).toBeFocused();

    await pressTab(page, browserName);
    await test
      .expect(q.button("Review Real focus fruit options"))
      .toBeFocused();

    await pressTab(page, browserName);
    await test.expect(list).toBeFocused();
    await test
      .expect(q.status("Real focus fruit base element"))
      .toHaveText("combobox");

    await page.keyboard.press("ArrowDown");
    await test
      .expect(list.getByRole("option", { name: "Apple" }))
      .toBeFocused();

    await list.focus();
    await page.keyboard.press("ArrowUp");
    await test
      .expect(list.getByRole("option", { name: "Orange" }))
      .toBeFocused();

    await list.focus();
    await page.keyboard.press("Home");
    await test
      .expect(list.getByRole("option", { name: "Apple" }))
      .toBeFocused();

    await list.focus();
    await page.keyboard.press("End");
    await test
      .expect(list.getByRole("option", { name: "Orange" }))
      .toBeFocused();
  });

  test("tabs to a non-scrollable list with virtual focus", async ({
    page,
    q,
    browserName,
  }) => {
    await q.combobox("Virtual focus fruit").click();
    const input = q.combobox("Search Virtual focus fruit");
    const list = q.listbox("Virtual focus fruit");
    await test.expect(input).toBeFocused();

    await pressTab(page, browserName);
    await test
      .expect(q.button("Review Virtual focus fruit options"))
      .toBeFocused();

    await pressTab(page, browserName);
    await test.expect(list).toBeFocused();
    await test
      .expect(q.status("Virtual focus fruit base element"))
      .toHaveText("combobox");

    await page.keyboard.press("ArrowDown");
    const apple = list.getByRole("option", { name: "Apple" });
    await test.expect(input).toBeFocused();
    await test.expect(apple).toHaveAttribute("data-focus-visible", "true");

    await list.focus();
    await page.keyboard.press("ArrowUp");
    const orange = list.getByRole("option", { name: "Orange" });
    await test.expect(input).toBeFocused();
    await test.expect(orange).toHaveAttribute("data-focus-visible", "true");
  });
});
