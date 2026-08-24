import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getCommandShortcut(command: Locator) {
  const keys = await command.getAttribute("aria-keyshortcuts");
  if (!keys) {
    throw new Error("Expected the command to expose aria-keyshortcuts");
  }
  return keys;
}

withFramework(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7069
  test("routes shared keys to the focused lane", async ({ page, q }) => {
    const inbox = q.region("Inbox");
    const week = q.region("This week");
    const inboxHints = page.locator(
      '[aria-label="Inbox shortcuts"] .ns-scope-shortcut',
    );
    const weekHints = page.locator(
      '[aria-label="This week shortcuts"] .ns-scope-shortcut',
    );

    await inbox.focus();
    await test.expect(inboxHints).toHaveCount(2);
    await test.expect(inboxHints.first()).toHaveAttribute("data-in-scope");
    await test.expect(inboxHints.first()).toHaveCSS("visibility", "visible");
    await test.expect(weekHints.first()).not.toHaveAttribute("data-in-scope");
    await test.expect(weekHints.first()).toHaveCSS("visibility", "hidden");

    await page.keyboard.press("n");
    await test.expect(q.button(/Untitled inbox task 4/)).toBeVisible();
    await test.expect(q.button(/Untitled this week task 4/)).toHaveCount(0);

    await week.focus();
    await page.keyboard.press("n");
    await test.expect(q.button(/Untitled this week task 4/)).toBeVisible();
    await test.expect(inboxHints.first()).not.toHaveAttribute("data-in-scope");
    await test.expect(weekHints.first()).toHaveAttribute("data-in-scope");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("gives the deepest nested scope priority", async ({ page, q }) => {
    const routes = q.toolbar("Inbox capture routes");
    await routes.focus();
    await test.expect(routes).toBeFocused();
    await test
      .expect(routes)
      .toHaveAttribute("aria-activedescendant", "quick-note-route");
    await test
      .expect(q.button("Quick note"))
      .toHaveAttribute("data-active-item");
    await test.expect(q.button("Quick note")).toHaveAttribute("data-in-scope");
    await page.keyboard.press("n");

    await test.expect(q.button(/Untitled inbox task 4/)).toHaveCount(0);
    await test
      .expect(q.status("Activity"))
      .toContainText("Captured a quick note by keyboard.");
    await test
      .expect(q.status("Quick captures"))
      .toHaveText(/1\s*captured · 1 proxied/);

    await page.keyboard.press("ArrowRight");
    await test
      .expect(routes)
      .toHaveAttribute("aria-activedescendant", "inbox-task-route");
    await test
      .expect(q.button("Inbox task"))
      .toHaveAttribute("data-active-item");
    await page.keyboard.press("n");
    await test.expect(q.button(/Untitled inbox task 4/)).toBeVisible();
    await test
      .expect(q.status("Quick captures"))
      .toHaveText(/1\s*captured · 1 proxied/);
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("supports alternative keys and explicit scope arrays", async ({
    page,
    q,
  }) => {
    await q.button(/Map onboarding gaps/).focus();
    await page.keyboard.press("Delete");
    await test.expect(q.button(/Map onboarding gaps/)).toHaveCount(0);

    await q.button(/Prototype search states/).focus();
    await page.keyboard.press("Backspace");
    await test.expect(q.button(/Prototype search states/)).toHaveCount(0);

    await q.region("This week").focus();
    const review = q.button("Start review");
    await test.expect(review).toHaveAttribute("aria-keyshortcuts", /Enter$/);
    await page.keyboard.press(await getCommandShortcut(review));
    await test
      .expect(q.status("Activity"))
      .toContainText("Started a review for the active lane.");
    await test.expect(q.status("Reviews")).toHaveText(/1\s*Reviews/);
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("keeps a portalled menu in its owner scope", async ({ page, q }) => {
    await q.button("Inbox lane actions").click();
    const menu = q.menu("Inbox lane actions");
    await test.expect(menu).toBeVisible();
    await test.expect(menu).toBeFocused();

    await page.keyboard.press("n");
    await test.expect(q.button(/Untitled inbox task 4/)).toBeVisible();
    await test
      .expect(q.status("Activity"))
      .toContainText("Added a task to Inbox by keyboard.");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("lets a disabled nested provider fall through to its parent", async ({
    page,
    q,
  }) => {
    await q.button("Inbox lane actions").click();
    await q.menuitem(/Quick edit Inbox task/).click();
    const dialog = q.dialog("Tune the task");
    const dialogQuery = query(dialog);
    await test.expect(dialog).toBeVisible();
    const title = q.textbox("Task title");
    await test.expect(title).toBeFocused();
    const save = q.button("Save task");
    await test.expect(save).toHaveAttribute("aria-keyshortcuts", /S$/);
    const saveKeys = await getCommandShortcut(save);

    await page.keyboard.press(saveKeys);
    await test.expect(q.status("Quick edit saves")).toContainText("1");
    await test
      .expect(dialogQuery.status("Workspace saves"))
      .toHaveText(/0\s*Workspace saves/);

    await q.checkbox(/^Use dialog shortcuts/).click();
    await title.focus();
    await page.keyboard.press(saveKeys);
    await test.expect(q.status("Quick edit saves")).toContainText("1");
    await test
      .expect(dialogQuery.status("Workspace saves"))
      .toHaveText(/1\s*Workspace saves/);
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("keeps global help and the always-visible guide available", async ({
    page,
    q,
  }) => {
    await q.region("Inbox").focus();
    await page.keyboard.press("Shift+Slash");

    await test.expect(q.text("Help is open")).toBeVisible();
    await test.expect(q.text("New inbox task")).toBeVisible();
    await test.expect(q.text("Save workspace")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("shows the active shortcut scope @visual", async ({ q, visual }) => {
    await q.region("Inbox").focus();
    await test
      .expect(q.status("Activity"))
      .toContainText("Inbox shortcuts are active.");
    await visual({
      viewports: { desktop: { height: 800, width: 1280 } },
    });
  });
});
