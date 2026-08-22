import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("ignores a stale clipboard completion", async ({ page, q }) => {
    let finishWrite = () => {};
    let markWriteStarted = () => {};
    const writeStarted = new Promise<void>((resolve) => {
      markWriteStarted = resolve;
    });
    await page.exposeFunction(
      "writeClipboard",
      () =>
        new Promise<void>((resolve) => {
          finishWrite = resolve;
          markWriteStarted();
        }),
    );
    await page.evaluate(() => {
      const testWindow = window as typeof window & {
        clipboardWriteFinished?: boolean;
        writeClipboard: () => Promise<void>;
      };
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            await testWindow.writeClipboard();
            testWindow.clipboardWriteFinished = true;
          },
        },
      });
    });

    await q.button("Copy code").click();
    await writeStarted;
    await q.button("Change text").click();
    finishWrite();
    await page.waitForFunction(
      () =>
        (window as typeof window & { clipboardWriteFinished?: boolean })
          .clipboardWriteFinished,
    );
    // The exposed callback resolves across the Playwright bridge, so cross a
    // frame checkpoint before sampling the resulting React state.
    await flushFrames(page);

    await q.button("Copy code").hover();
    const tooltip = q.tooltip();
    await test.expect(tooltip).toBeVisible();
    test.expect(await tooltip.textContent()).toBe("Copy second");
  });
});
