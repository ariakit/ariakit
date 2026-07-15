import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/2946#issuecomment-4977621514
  test("focuses a conditionally mounted menu that opens by default", async ({
    q,
  }) => {
    await q.button("Add item").click();

    const menu = q.menu("Actions for new item");
    await test.expect(menu).toBeVisible();
    await test.expect(menu).toBeFocused();
    await test
      .expect(q.menuitem("Rename"))
      .not.toHaveAttribute("data-active-item");
  });

  test("respects autofocus opt-out when mounting open", async ({ page, q }) => {
    await q.button("Add passive item").click();

    await test.expect(q.menu("Actions for new item")).toBeVisible();
    await test.expect(page.locator("body")).toBeFocused();
    await test.expect(q.text("Store autofocus: disabled")).toBeVisible();
  });

  test("preserves modal menu item focus when mounting open", async ({ q }) => {
    await q.button("Add modal item").click();

    const item = q.menuitem("Rename");
    await test.expect(item).toBeFocused();
    await test.expect(item).toHaveAttribute("data-active-item");
  });

  test("focuses a conditionally mounted controlled-open menu", async ({
    q,
  }) => {
    await q.button("Add controlled item").click();

    await test.expect(q.menu("Actions for new item")).toBeFocused();
  });

  test("focuses a conditionally mounted menu created with useMenu", async ({
    q,
  }) => {
    await q.button("Add hook item").click();

    await test.expect(q.menu("Hook actions")).toBeFocused();
  });

  test("does not refocus an open menu when its store is replaced", async ({
    q,
  }) => {
    await q.button("Add related item").click();
    await q.menuitem("Change parent").focus();
    await q.menuitem("Change parent").click();

    await test.expect(q.menuitem("Parent changed")).toBeFocused();
  });

  test("does not autofocus a menu opened after mounting", async ({ q }) => {
    await q.button("Add deferred item").click();
    const button = q.button("Show deferred actions");
    await button.focus();
    await button.click();

    await test.expect(q.menuitem("Archive")).toBeVisible();
    await test.expect(q.menu()).not.toBeFocused();
    await test.expect(q.menuitem("Archive")).not.toBeFocused();
  });

  test("does not autofocus after closing before passive effects", async ({
    q,
  }) => {
    await q.button("Add initially hidden item").click();
    const button = q.button("Show initially hidden actions");
    await button.focus();
    await button.click();

    await test.expect(q.menuitem("Download")).toBeVisible();
    await test.expect(q.menu()).not.toBeFocused();
    await test.expect(q.menuitem("Download")).not.toBeFocused();
  });

  test("does not autofocus a lazily rendered menu", async ({ q }) => {
    await q.button("Add lazy item").click();
    const button = q.button("Show lazy actions");
    await button.focus();
    await button.click();

    await test.expect(q.menuitem("Export")).toBeVisible();
    await test.expect(q.menu()).not.toBeFocused();
    await test.expect(q.menuitem("Export")).not.toBeFocused();
  });

  test("does not autofocus a default-open menu rendered after its store commits", async ({
    q,
  }) => {
    await q.button("Add late default-open item").click();
    const button = q.button("Render default-open actions");
    await button.focus();
    await button.click();

    await test.expect(q.menuitem("Move")).toBeVisible();
    await test.expect(q.menu("Late actions")).not.toBeFocused();
    await test.expect(q.menuitem("Move")).not.toBeFocused();
  });

  test("does not autofocus a controlled-open menu rendered after its store commits", async ({
    q,
  }) => {
    await q.button("Add late controlled item").click();
    const button = q.button("Render controlled actions");
    await button.focus();
    await button.click();

    await test.expect(q.menuitem("Publish")).toBeVisible();
    await test.expect(q.menu("Late controlled actions")).not.toBeFocused();
    await test.expect(q.menuitem("Publish")).not.toBeFocused();
  });
});
