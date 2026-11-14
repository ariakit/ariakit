import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the photo, or the initials when it fails or is missing", async ({
    q,
  }) => {
    // Each photo is decorative, so it has no role to query.
    const photo = q.img("Hana Kobayashi").locator("img");
    await test.expect(photo).toHaveJSProperty("complete", true);
    await test.expect(photo).not.toHaveJSProperty("naturalWidth", 0);
    for (const [name, initials] of [
      ["Tom Becker", "TB"],
      ["Rosa Delgado", "RD"],
    ] as const) {
      const avatar = q.img(name);
      await test.expect(avatar).toHaveText(initials);
      await test.expect(avatar.locator("img")).toHaveCount(0);
    }
  });
});
