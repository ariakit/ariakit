import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows placeholders after 150 ms for at least 200 ms", async ({ q }) => {
    // The placeholders can stay after the data arrives, so wait for the
    // content.
    await test.expect(q.button("Message")).toBeVisible();
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

  // https://github.com/ariakit/ariakit/pull/7993#discussion_r4317370427
  test("shows the placeholders for a reload right after the content", async ({
    page,
    q,
  }) => {
    await test.expect(q.button("Message")).toBeVisible();
    await q.button("Reload").click();
    await test.expect(q.status()).toHaveText("Loading contact");
    // Reload again in the same task that shows the content, so the reload
    // starts right after it. A locator click waits for its own checks first,
    // which can take longer than the delay.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          const reloadOnContent = () => {
            const buttons = Array.from(document.querySelectorAll("button"));
            const message = buttons.find(
              (button) =>
                button.textContent === "Message" &&
                !button.closest("[aria-hidden]"),
            );
            if (!message) return;
            observer.disconnect();
            buttons.find((button) => button.textContent === "Reload")?.click();
            resolve();
          };
          const observer = new MutationObserver(reloadOnContent);
          observer.observe(document.body, { childList: true, subtree: true });
          // The content may already show on a slow runner.
          reloadOnContent();
        }),
    );
    await test.expect(q.status()).toHaveText("Loading contact");
    await test.expect(q.status()).toHaveText("Contact loaded");
    const times = q.definition();
    await test.expect(times.nth(1)).toHaveText(/^\d+ ms$/);
    // Content has no minimum duration, so the delay starts with the reload. The
    // request ends at 250 ms, after the 150 ms delay, so the placeholders must
    // show.
    await test.expect(times.nth(0)).toHaveText(/^\d+ ms$/);
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
