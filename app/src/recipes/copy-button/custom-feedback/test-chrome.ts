import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("keeps the custom feedback for its duration", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await q.button("Copy the test key").click();
    await test.expect(q.status()).toHaveText("Key copied");
    // The default feedback lasts 2 seconds and this one lasts 4, so this wait
    // ends between them.
    await page.waitForTimeout(3000);
    // A single read checks the feedback at this point.
    test.expect(await q.status().textContent()).toBe("Key copied");
    await test.expect(q.status()).toHaveText("", { timeout: 3000 });
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
    const copy = q.button("Copy the test key");
    await copy.click();
    await test.expect(q.status()).toHaveText("Couldn't copy the key");
    await test
      .expect(query(copy).text("Couldn't copy the key"))
      .toHaveCSS("opacity", "1");
    await test.expect(copy).toHaveAccessibleName("Copy the test key");
  });
});
