import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("filters one list and names each tab with its count", async ({ q }) => {
    await test.expect(q.tab("Open 3")).toHaveAttribute("aria-selected", "true");
    const open = query(q.tabpanel("Open 3"));
    await test.expect(open.listitem()).toHaveCount(3);
    await test
      .expect(open.text("Login button overlaps the logo"))
      .toBeVisible();

    await q.tab("Closed 3").click();
    const closed = query(q.tabpanel("Closed 3"));
    await test.expect(closed.listitem()).toHaveCount(3);
    await test.expect(closed.text("Dates ignore the time zone")).toBeVisible();
    await test
      .expect(closed.text("Login button overlaps the logo"))
      .toHaveCount(0);
  });
});
