import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("names each speed by its label and describes it by its latency", async ({
    q,
  }) => {
    await test.expect(q.radio("Fast")).toHaveAccessibleDescription("50 ms");
    await test.expect(q.radio("Medium")).toHaveAccessibleDescription("250 ms");
    await test.expect(q.radio("Slow")).toHaveAccessibleDescription("1500 ms");
  });

  test("shows placeholders after 150 ms for at least 200 ms", async ({ q }) => {
    // The placeholders can stay after the data arrives, so wait for the
    // content.
    await test.expect(q.button("Message")).toBeVisible();
    const times = q.definition();
    // A fast request (50 ms) skips the placeholders, so the times below can
    // only come from the medium request that follows.
    await q.radio("Fast").click();
    await test.expect(times.nth(0)).toHaveText("Skipped");
    await test.expect(times.nth(1)).toHaveText(/^\d+ ms$/);
    // A medium request (250 ms) shows the placeholders at 150 ms and keeps them
    // until 350 ms, after the data arrives.
    await q.radio("Medium").click();
    await test.expect(q.status()).toHaveText("Loading contact");
    await test.expect(q.status()).toHaveText("Contact loaded");
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

  test("hides the previous contact while it reloads", async ({ q }) => {
    await test.expect(q.button("Message")).toBeVisible();
    await q.radio("Slow").click();
    await test.expect(q.status()).toHaveText("Loading contact");
    await test.expect(q.button("Message")).toHaveCount(0);
    await test.expect(q.status()).toHaveText("Contact loaded");
    await test.expect(q.button("Message")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/7993#discussion_r4317370427
  test("shows the placeholders for a reload right after the content", async ({
    page,
    q,
  }) => {
    await test.expect(q.button("Message")).toBeVisible();
    await q.radio("Slow").click();
    await test.expect(q.status()).toHaveText("Loading contact");
    // Switch to the medium speed in the same task that shows the content, so
    // the reload starts right after it. A locator click waits for its own
    // checks first, which can take longer than the delay.
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
            const medium = document.querySelector<HTMLInputElement>(
              "input[type='radio'][value='250']",
            );
            medium?.click();
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
    // The first request (250 ms) shows the placeholders, so "Skipped" below can
    // only come from the fast request.
    const times = q.definition();
    await test.expect(times.nth(0)).toHaveText(/^\d+ ms$/);
    await q.radio("Fast").click();
    // The fast request (50 ms) ends before the 150 ms delay, so the loading
    // status can change back before an assertion sees it. The timeline keeps
    // the result.
    await test.expect(times.nth(0)).toHaveText("Skipped");
    await test.expect(times.nth(1)).toHaveText(/^\d+ ms$/);
    await test.expect(q.status()).toHaveText("Contact loaded");
  });
});
