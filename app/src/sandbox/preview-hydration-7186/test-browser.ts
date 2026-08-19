import { test as appTest } from "#app/test-utils/fixtures.ts";
import { withFramework } from "#app/test-utils/preview.ts";

appTest.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const NativeMessageChannel = window.MessageChannel;
    window.MessageChannel = class extends NativeMessageChannel {
      constructor() {
        super();
        const postMessage = this.port2.postMessage.bind(this.port2);
        this.port2.postMessage = (message) => {
          // Cross gotoAndSettle's 500ms network-idle window while leaving
          // Playwright's polling task free to observe the pending React commit.
          setTimeout(() => postMessage(message), 750);
        };
      }
    };
  });
});

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7186
  test("waits for the framework to commit", async ({ q }) => {
    const preview = q.text("Preview content");
    const committed = await preview.getAttribute("data-preview-commit");

    test.expect(committed).toBe("");
  });
});
