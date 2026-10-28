import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6849
  test("keeps descendants of a persistent form inside the dialog context", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await q.textbox("Persistent form field").click();
    await test.expect(q.textbox("Persistent form field")).toBeFocused();
    // Outside interactions can request a close that React commits afterward. No
    // state tracks that commit when the popup must stay open.
    await flushFrames(page);
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/6344
  test("keeps the documented behavior after the dialog has been focused", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    // Focusing inside the dialog first is the documented, working path.
    await q.textbox("Inside field").click();
    await test.expect(q.textbox("Inside field")).toBeFocused();

    await q.textbox("Notification field").click();
    await test.expect(q.textbox("Notification field")).toBeFocused();
    // Outside interactions can request a close that React commits afterward. No
    // state tracks that commit when the popup must stay open.
    await flushFrames(page);
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  test("still closes when interacting outside before the dialog is focused", async ({
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await q.textbox("Outside field").click();
    await test.expect(q.dialog("Dialog")).not.toBeVisible();
  });
});
