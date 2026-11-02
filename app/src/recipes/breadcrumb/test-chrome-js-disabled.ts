import { withFramework } from "#app/test-utils/preview.ts";

// Without JavaScript, the page keeps the server markup. A trail has no state,
// so it must work as it is.
withFramework(import.meta.dirname, async ({ test, query }) => {
  test.use({ javaScriptEnabled: false });

  test("shows the whole trail with no script", async ({ q }) => {
    const trail = query(q.navigation("Breadcrumb"));
    await test.expect(trail.link("Home")).toBeVisible();
    await test.expect(trail.link("Garden")).toBeVisible();
    await test.expect(trail.link("Tools")).toBeVisible();
    await test
      .expect(trail.text("Pruning shears"))
      .toHaveAttribute("aria-current", "page");
    await test.expect(trail.listitem()).toHaveCount(4);
  });
});
