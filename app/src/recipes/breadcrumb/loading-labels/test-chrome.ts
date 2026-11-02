import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the ancestors after the request", async ({ q }) => {
    await test
      .expect(q.text("Latency by region"))
      .toHaveAttribute("aria-current", "page");
    await test.expect(q.link("Observability")).toBeVisible();
    await test
      .expect(q.navigation("Breadcrumb"))
      .toHaveAttribute("aria-busy", "false");
  });

  test("replaces the links while a reload runs", async ({ q }) => {
    const reload = q.button("Reload");
    await test.expect(reload).toBeEnabled();
    await reload.click();
    await test.expect(q.link("Northwind")).toBeHidden();
    await test.expect(q.link("Northwind")).toBeVisible();
  });

  test("animates the placeholders and keeps the layout", async ({
    page,
    q,
  }) => {
    const reload = q.button("Reload");
    const current = q.text("Latency by region");
    await test.expect(q.link("Northwind")).toBeVisible();
    const loadedReload = await reload.boundingBox();
    const loadedCurrent = await current.boundingBox();
    await reload.click();
    await test.expect(q.link("Northwind")).toBeHidden();
    // Parts animate only inside a skeleton root that is loading.
    await test.expect(page.locator(".skeleton-shimmer")).toHaveCount(1);
    const loadingReload = await reload.boundingBox();
    const loadingCurrent = await current.boundingBox();
    test.expect(loadingReload?.y).toBe(loadedReload?.y);
    test.expect(loadingCurrent?.y).toBe(loadedCurrent?.y);
    // The placeholders can't know the width of the text that replaces them, so
    // the last step moves by a few pixels at most.
    const shift = Math.abs((loadingCurrent?.x ?? 0) - (loadedCurrent?.x ?? 0));
    test.expect(shift).toBeLessThan(4);
  });
});
