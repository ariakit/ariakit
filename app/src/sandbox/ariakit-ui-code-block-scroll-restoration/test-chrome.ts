import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps the scroll position of the code for each tab", async ({ q }) => {
    const getScrollLeft = (name: string) =>
      q.region(name).evaluate((element) => element.scrollLeft);
    await q.region("npm").evaluate((element) => element.scrollTo({ left: 80 }));
    await test.expect.poll(() => getScrollLeft("npm")).toBe(80);
    // The pnpm command starts at the start of its line.
    await q.tab("pnpm").click();
    await test.expect.poll(() => getScrollLeft("pnpm")).toBe(0);
    await q.tab("npm").click();
    await test.expect.poll(() => getScrollLeft("npm")).toBe(80);
  });
});
