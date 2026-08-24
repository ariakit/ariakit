import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("updates one upload notification through completion", async ({ q }) => {
    await test.expect(q.alertdialog("Transfers restored")).toBeVisible();

    await q.button("Start upload").click();
    const uploading = q.alertdialog("Uploading design-assets.zip");
    await test.expect(uploading).toContainText("0 of 12 files uploaded.");

    for (let index = 0; index < 4; index += 1) {
      await q.button("Advance upload").click();
    }

    await test
      .expect(q.alertdialog("Upload complete"))
      .toContainText("12 files uploaded successfully.");
  });

  // https://github.com/ariakit/ariakit/issues/7235
  test("debounces search result announcements", async ({ page, q }) => {
    const search = q.textbox("Search files");
    const announcements = q
      .log(undefined, { includeHidden: true })
      .filter({ hasText: /files? found\./ });

    await search.pressSequentially("archive");

    await test.expect(q.text("1 item")).toBeVisible();
    await test.expect(announcements).toHaveCount(0);
    // No DOM state tracks the pending 300ms debounce. Cross it while staying
    // within the announcer node's separate 350ms lifetime.
    await page.waitForTimeout(350);
    await test.expect(announcements).toHaveCount(1);
    await test.expect(announcements).toHaveText("1 file found.");
    await test.expect(q.alertdialog()).toHaveCount(1);
  });

  test("limits a burst and filters the stack for attention", async ({ q }) => {
    await q.button("Queue 10 files").click();

    await test.expect(q.alertdialog()).toHaveCount(3);
    await test.expect(q.alertdialog("File 8 queued")).toBeVisible();
    await test.expect(q.alertdialog("File 10 queued")).toBeVisible();

    await q.button("Test storage warning").click();
    await q.button("Attention").click();

    await test.expect(q.alertdialog()).toHaveCount(1);
    await test.expect(q.alertdialog("Storage is full")).toBeVisible();
  });
});
