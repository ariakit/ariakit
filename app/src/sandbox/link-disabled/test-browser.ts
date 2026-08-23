import type { Page } from "@ariakit/test/playwright";
import { withFramework } from "#app/test-utils/preview.ts";

function pressTab(page: Page, browserName: string) {
  const key = browserName === "webkit" ? "Alt+Tab" : "Tab";
  return page.keyboard.press(key);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps only the explainable disabled link in the tab order", async ({
    browserName,
    page,
    q,
  }) => {
    await q.button("Before links").focus();
    await pressTab(page, browserName);
    await test.expect(q.link("Reachable disabled link")).toBeFocused();

    await pressTab(page, browserName);
    await test.expect(q.button("After links")).toBeFocused();
  });
});
