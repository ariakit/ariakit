import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("confirms the copy in the tooltip and in a status message", async ({
    page,
    q,
  }) => {
    const copy = q.button("Copy link");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await copy.scrollIntoViewIfNeeded();
    await copy.hover();
    await test.expect(q.tooltip("Copy link")).toBeVisible();
    await copy.click();
    // The tooltip stays open and changes its text.
    await test.expect(q.tooltip("Copied")).toBeVisible();
    await test.expect(q.status()).toHaveText("Link copied to the clipboard.");
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(clipboard).toBe(await q.textbox("Invite link").inputValue());
    // The feedback ends after two seconds.
    await test.expect(q.tooltip("Copy link")).toBeVisible({ timeout: 4000 });
    await test.expect(q.status()).toHaveText("");
  });

  test("shows the feedback for the full duration after each copy", async ({
    page,
    q,
  }) => {
    const copy = q.button("Copy link");
    await copy.click();
    await test.expect(q.status()).toHaveText("Link copied to the clipboard.");
    // The example shows the feedback for 2 seconds, so the second copy comes
    // while the feedback of the first one shows.
    await page.waitForTimeout(1500);
    await copy.click();
    // The feedback of the first copy would end 0.5 seconds after the second
    // copy, and the feedback of the second copy ends 2 seconds after it. This
    // wait ends between them.
    await page.waitForTimeout(1000);
    // The feedback still shows. A single read checks it at this point.
    test
      .expect(await q.status().textContent())
      .toBe("Link copied to the clipboard.");
    await test.expect(q.status()).toHaveText("", { timeout: 4000 });
  });
});
