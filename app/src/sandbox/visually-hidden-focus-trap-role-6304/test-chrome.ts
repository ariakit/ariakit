import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6304
  test("documented zero-argument Solid hooks return usable props", async ({
    q,
  }) => {
    await test
      .expect(q.link(/Learn more\s+about the Solar System/))
      .toBeVisible();
    await test.expect(q.region("Focus trap region")).toBeVisible();
    await test.expect(q.text("Role rendered")).toBeVisible();
    await test
      .expect(q.text(/about the Solar System/))
      .toHaveCSS("position", "absolute");
  });
});
