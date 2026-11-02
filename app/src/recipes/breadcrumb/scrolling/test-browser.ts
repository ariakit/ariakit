import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("starts at the current step on one row", async ({ q }) => {
    const trail = query(q.navigation("Breadcrumb"));
    await test.expect(trail.text("Warehouse checklist")).toBeInViewport({
      ratio: 1,
    });
    const nav = q.navigation("Breadcrumb");
    const fits = await nav.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const inRow = (target: Element | null) => {
        const rect = target?.getBoundingClientRect();
        if (!rect) return false;
        return rect.left >= box.left - 1 && rect.right <= box.right + 1;
      };
      return {
        current: inRow(element.querySelector("[aria-current]")),
        first: inRow(element.querySelector("a")),
      };
    });
    test.expect(fits).toEqual({ current: true, first: false });
  });

  test("scrolls an earlier link into view on focus", async ({ q }) => {
    const first = query(q.navigation("Breadcrumb")).link("Northwind");
    await first.focus();
    await test.expect(first).toBeInViewport({ ratio: 1 });
  });
});
