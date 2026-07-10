import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("restores focus once with the latest callback", async ({ q }) => {
    await test.expect(q.status("Focus callbacks")).toHaveText("none");

    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();
    await test.expect(q.status("Focus callbacks")).toHaveText("none");

    await q.button("Use second callback").click();
    await test.expect(q.status("Focus callbacks")).toHaveText("none");

    await q.button("Close dialog").click();

    await test.expect(q.status("Focus callbacks")).toHaveText("second");
    await test.expect(q.button("Open dialog")).toBeFocused();
  });

  test("restores focus when Activity hides the dialog", async ({ q }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();
    await test.expect(q.status("Focus callbacks")).toHaveText("none");

    await q.button("Hide activity").click();

    const dialog = q.dialog("Dialog", { includeHidden: true });
    await test.expect(dialog).not.toBeVisible();
    await test.expect(q.status("Focus callbacks")).toHaveText("first");
    await test.expect(q.button("Open dialog")).toBeFocused();
  });

  test("does not restore focus from a replaced dialog", async ({ q }) => {
    await q.button("Open dialog without final focus").click();
    await q.button("Remount dialog").click();

    await test.expect(q.dialog("Dialog")).toBeVisible();
    await test.expect(q.status("Focus callbacks")).toHaveText("none");
  });

  test("does not restore focus from a replaced portaled dialog", async ({
    q,
  }) => {
    await q.button("Open portaled dialog without final focus").click();
    await q.button("Remount dialog").click();

    await test.expect(q.dialog("Dialog")).toBeVisible();
    await test.expect(q.status("Focus callbacks")).toHaveText("none");
  });

  test("does not restore focus when disabled", async ({ q }) => {
    await q.button("Open dialog").click();
    await q.button("Disable focus restoration").click();
    await q.button("Close dialog").click();

    await test.expect(q.status("Focus callbacks")).toHaveText("none");
  });

  test("does not restore focus after reopening before a retry", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await q.button("Close and reopen dialog").click();
    await flushFrames(page);

    await test.expect(q.dialog("Dialog")).toBeVisible();
    await test.expect(q.status("Focus callbacks")).toHaveText("none");
  });

  test("does not run a superseded retry after the replacement closes", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await q.button("Close replacement before retry").click();
    await flushFrames(page);

    await test.expect(q.dialog("Dialog")).not.toBeVisible();
    await test.expect(q.status("Focus callbacks")).toHaveText("first");
  });

  test("does not restore focus again after closing while hidden", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await q.button("Prevent focus restoration").click();
    await q.button("Hide, close, and show activity").click();

    await test.expect(q.status("Dialog state")).toHaveText("visible, closed");
    await flushFrames(page);
    await test.expect(q.status("Focus callbacks")).toHaveText("first");
  });
});
