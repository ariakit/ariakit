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
