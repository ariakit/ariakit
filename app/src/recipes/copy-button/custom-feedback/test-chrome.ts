import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("keeps the custom feedback for its duration", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const copy = q.button("Copy the test key");
    await copy.click();
    const copied = q.button("Key copied");
    await test.expect(copied).toBeVisible();
    // The default feedback lasts 2 seconds and this one lasts 4, so this wait
    // ends between them.
    await page.waitForTimeout(3000);
    // A single read checks the feedback at this point.
    test.expect(await copied.count()).toBe(1);
    await test.expect(copy).toBeVisible({ timeout: 3000 });
  });

  test("shows the custom text of a failed copy in the label", async ({
    context,
    page,
    q,
  }) => {
    const client = await context.newCDPSession(page);
    const { targetInfo } = await client.send("Target.getTargetInfo");
    // Chromium allows clipboard writes on a page with user activation, so the
    // permission must be denied explicitly.
    await client.send("Browser.setPermission", {
      permission: { name: "clipboard-write" },
      setting: "denied",
      origin: new URL(page.url()).origin,
      browserContextId: targetInfo.browserContextId,
    });
    await q.button("Copy the test key").click();
    const failed = q.button("Couldn't copy the key");
    await test.expect(failed).toBeVisible();
    await test
      .expect(query(failed).text("Couldn't copy the key"))
      .toBeVisible();
    await test.expect(query(failed).text("Copy the test key")).toBeHidden();
  });
});
