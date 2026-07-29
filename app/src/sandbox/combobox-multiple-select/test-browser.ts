import type { Page } from "@ariakit/test/playwright";
import { withFramework } from "#app/test-utils/preview.ts";

function pressTab(page: Page, browserName: string) {
  const key = browserName === "webkit" ? "Alt+Tab" : "Tab";
  return page.keyboard.press(key);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("tabs past a popover rendered as a list", async ({
    page,
    q,
    browserName,
  }) => {
    await q.combobox().click();
    const list = q.listbox();
    await test.expect(list).toBeVisible();
    await test.expect(list).toHaveAttribute("tabindex", "-1");

    await pressTab(page, browserName);
    await test.expect(q.button("After combobox")).toBeFocused();
  });
});
