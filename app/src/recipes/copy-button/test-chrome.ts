import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("copies the value and reports it until the feedback ends", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const copy = q.button("Copy invite code");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await copy.scrollIntoViewIfNeeded();
    await copy.hover();
    await test.expect(q.tooltip("Copy invite code")).toBeVisible();
    await copy.click();
    await test.expect(q.tooltip("Copied")).toBeVisible();
    const copied = q.button("Copied");
    await test.expect(copied).toBeVisible();
    // On a touch screen, the icon is the only visible feedback.
    await test.expect(copied.locator("svg.lucide-check")).toBeVisible();
    const text = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(text).toBe("7F3K-2PLQ");
    await test.expect(copy).toBeVisible({ timeout: 4000 });
    await test.expect(q.tooltip("Copy invite code")).toBeVisible();
    await test.expect(copy.locator("svg.lucide-copy")).toBeVisible();
  });

  test("reports a failed copy", async ({ context, page, q }) => {
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
    const copy = q.button("Copy invite code");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await copy.scrollIntoViewIfNeeded();
    await copy.hover();
    await test.expect(q.tooltip("Copy invite code")).toBeVisible();
    await copy.click();
    await test.expect(q.tooltip("Couldn't copy")).toBeVisible();
    const failed = q.button("Couldn't copy");
    await test.expect(failed).toBeVisible();
    await test.expect(failed.locator("svg.lucide-x")).toBeVisible();
  });

  test("shows the feedback for the full duration after each copy", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await q.button("Copy invite code").click();
    const copied = q.button("Copied");
    await test.expect(copied).toBeVisible();
    // The feedback lasts 2 seconds, so the second copy comes while the feedback
    // of the first one shows.
    await page.waitForTimeout(1500);
    // A late click would find the first name again, and the feedback would
    // still restart from it.
    await q.button(/^(Copy invite code|Copied)$/).click();
    // The feedback of the first copy would end 0.5 seconds after the second
    // copy, and the feedback of the second copy ends 2 seconds after it. This
    // wait ends between them.
    await page.waitForTimeout(1000);
    // A single read checks the feedback at this point.
    test.expect(await copied.count()).toBe(1);
    await test
      .expect(q.button("Copy invite code"))
      .toBeVisible({ timeout: 4000 });
  });
});
