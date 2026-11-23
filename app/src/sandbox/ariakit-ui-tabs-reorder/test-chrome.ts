import { withFramework } from "#app/test-utils/preview.ts";
import { getTabNames } from "./test-helpers.ts";

// The keys that move a tab are the same in every browser. Only the modifier
// differs, between Apple devices and other devices.
withFramework(import.meta.dirname, async ({ test }) => {
  test("moves the focused tab with the arrow keys and keeps the focus", async ({
    page,
    q,
  }) => {
    const tab = q.tab("utils.ts");
    await tab.focus();
    await page.keyboard.press("ControlOrMeta+Shift+ArrowRight");
    await test
      .expect(
        q.text(
          /^Files: 1 move\. index\.ts, tabs\.ariakit\.react\.tsx, README\.md, utils\.ts,/,
        ),
      )
      .toBeVisible();
    await test.expect(tab).toBeFocused();
    await test
      .expect(q.status().filter({ hasText: "utils.ts" }))
      .toHaveText("utils.ts moved to position 4 of 7");
    // The tab passes a disabled tab.
    await page.keyboard.press("ControlOrMeta+Shift+ArrowRight");
    await test
      .expect(
        q.text(
          /^Files: 2 moves\..* README\.md, package\.json, utils\.ts, tsconfig\.json,/,
        ),
      )
      .toBeVisible();
    await test.expect(tab).toBeFocused();
    await page.keyboard.press("ControlOrMeta+Shift+ArrowLeft");
    await test
      .expect(
        q.text(/^Files: 3 moves\..* README\.md, utils\.ts, package\.json,/),
      )
      .toBeVisible();
  });

  test("moves the focused tab to the ends with Home and End", async ({
    page,
    q,
  }) => {
    const list = q.tablist("Files");
    const tab = q.tab("utils.ts");
    await tab.focus();
    await page.keyboard.press("ControlOrMeta+Shift+End");
    await test.expect
      .poll(() => getTabNames(list))
      .toEqual([
        "index.ts",
        "tabs.ariakit.react.tsx",
        "README.md",
        "package.json",
        "tsconfig.json",
        "vite.config.ts",
        "utils.ts",
      ]);
    await test.expect(tab).toBeFocused();
    // The strip keeps the tab in view at its new place.
    await test.expect(tab).toBeInViewport({ ratio: 1 });
    await page.keyboard.press("ControlOrMeta+Shift+Home");
    await test.expect
      .poll(() => getTabNames(list))
      .toEqual([
        "utils.ts",
        "index.ts",
        "tabs.ariakit.react.tsx",
        "README.md",
        "package.json",
        "tsconfig.json",
        "vite.config.ts",
      ]);
    await test.expect(tab).toBeFocused();
    await test.expect(tab).toBeInViewport({ ratio: 1 });
    await test.expect(q.text(/^Files: 2 moves\./)).toBeVisible();
  });

  test("moves the focus, and not the tab, with a plain arrow key", async ({
    page,
    q,
  }) => {
    await q.tab("index.ts").focus();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("tabs.ariakit.react.tsx")).toBeFocused();
    await test.expect(q.text(/^Files: 0 moves\./)).toBeVisible();
  });

  test("moves a tab toward the end with the Left Arrow key from right to left", async ({
    page,
    q,
  }) => {
    const tab = q.tab("Home");
    await tab.focus();
    await page.keyboard.press("ControlOrMeta+Shift+ArrowLeft");
    await test
      .expect(q.text("Pages: 1 move. Search, Home, Settings"))
      .toBeVisible();
    await test.expect(tab).toBeFocused();
  });

  test("keeps a disabled tab and the tabs of a list without onReorder", async ({
    page,
    q,
  }) => {
    const disabled = q.tab("package.json");
    await disabled.focus();
    await page.keyboard.press("ControlOrMeta+Shift+ArrowLeft");
    // The key doesn't move the focus either, as a plain arrow key would.
    await test.expect(disabled).toBeFocused();
    await q.tab("index.ts").focus();
    await page.keyboard.press("ControlOrMeta+Shift+ArrowRight");
    // Only the second key press moved a tab.
    await test
      .expect(
        q.text(
          /^Files: 1 move\. tabs\.ariakit\.react\.tsx, index\.ts, utils\.ts, README\.md, package\.json,/,
        ),
      )
      .toBeVisible();
    await q.tab("One").focus();
    await page.keyboard.press("ControlOrMeta+Shift+End");
    await test.expect
      .poll(() => getTabNames(q.tablist("Fixed tabs")))
      .toEqual(["One", "Two", "Three"]);
  });
});
