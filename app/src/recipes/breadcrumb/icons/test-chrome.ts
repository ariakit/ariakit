import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("lines up the first icon and keeps the same gap on each step", async ({
    q,
  }) => {
    const trail = q.navigation("Breadcrumb");
    const offset = await trail.evaluate((element) => {
      const icon = element.querySelector("svg")?.getBoundingClientRect();
      return Math.abs((icon?.left ?? 0) - element.getBoundingClientRect().left);
    });
    test.expect(offset).toBeLessThan(0.5);
    const getGap = (name: string) =>
      q.link(name).evaluate((link) => {
        const icon = link.querySelector("svg")?.getBoundingClientRect();
        const label = link.lastElementChild?.getBoundingClientRect();
        return (label?.left ?? 0) - (icon?.right ?? 0);
      });
    test.expect(await getGap("Northwind")).toBe(await getGap("Field photos"));
  });
});
