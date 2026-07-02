// See https://github.com/ariakit/ariakit/issues/6322
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("typing into a dialog with an inline portalRef keeps focus and value", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Profile")).toBeVisible();

    await q.textbox("Name").click();
    await page.keyboard.type("hello");

    // Before the fix, the first keystroke re-renders the parent, the new
    // inline portalRef identity recreates the portal node, and the remounted
    // dialog moves focus to the Close button, so only "h" lands in the field.
    await test.expect(q.textbox("Name")).toHaveValue("hello");
    await test.expect(q.textbox("Name")).toBeFocused();
  });

  test("typing into a portal with an inline portalRef keeps focus and value", async ({
    page,
    q,
  }) => {
    await q.textbox("Notes").click();
    await page.keyboard.type("hello");

    // Before the fix, the portal node is recreated on every keystroke and
    // focus falls back to the body, so only "h" lands in the field.
    await test.expect(q.textbox("Notes")).toHaveValue("hello");
    await test.expect(q.textbox("Notes")).toBeFocused();
  });
});
