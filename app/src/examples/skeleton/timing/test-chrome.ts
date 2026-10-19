import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows placeholders after 150 ms for at least 200 ms", async ({
    page,
    q,
  }) => {
    // The placeholders can stay after the data arrives, so wait for the
    // content.
    await test.expect(q.button("Message")).toBeVisible();
    // The content also stays for at least 200 ms, which would postpone the
    // placeholders of a reload. No visible state marks the end of that window.
    await page.waitForTimeout(200);
    // A medium request (250 ms) shows the placeholders at 150 ms and keeps them
    // until 350 ms, after the data arrives.
    await q.button("Reload").click();
    await test.expect(q.status()).toHaveText("Loading contact");
    await test.expect(q.status()).toHaveText("Contact loaded");
    const times = q.definition();
    await test.expect(times.nth(1)).toHaveText(/^\d+ ms$/);
    const [placeholders = "", content = ""] = await times.allTextContents();
    const placeholdersTime = Number.parseInt(placeholders, 10);
    const contentTime = Number.parseInt(content, 10);
    // The example starts its clock no later than the delay, so a busy page can
    // only make these times longer. The request ends at 250 ms, so only the
    // minimum duration keeps the content from showing before 350 ms.
    test.expect(placeholdersTime).toBeGreaterThanOrEqual(150);
    test.expect(contentTime).toBeGreaterThanOrEqual(150 + 200);
  });

  test("skips the placeholders when the request is fast", async ({ q }) => {
    // The placeholders can stay after the data arrives, so wait for the
    // content.
    await test.expect(q.button("Message")).toBeVisible();
    await q.radio(/^Fast/).click();
    await test.expect(q.status()).toHaveText("Loading contact");
    await test.expect(q.status()).toHaveText("Contact loaded");
    const times = q.definition();
    await test.expect(times.nth(0)).toHaveText("Skipped");
    await test.expect(times.nth(1)).toHaveText(/^\d+ ms$/);
  });
});
