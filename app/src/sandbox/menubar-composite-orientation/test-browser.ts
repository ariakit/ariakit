import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders role and orientation attributes for composite menubars", async ({
    q,
  }) => {
    const defaultMenubar = q.menubar("Default menubar");
    await test.expect(defaultMenubar).toHaveAttribute("role", "menubar");
    await test
      .expect(defaultMenubar)
      .toHaveAttribute("aria-orientation", "horizontal");

    const verticalMenubar = q.menubar("Vertical menubar");
    await test.expect(verticalMenubar).toHaveAttribute("role", "menubar");
    await test
      .expect(verticalMenubar)
      .toHaveAttribute("aria-orientation", "vertical");

    const bothMenubar = q.menubar("Both menubar");
    await test.expect(bothMenubar).toHaveAttribute("role", "menubar");
    await test.expect(bothMenubar).not.toHaveAttribute("aria-orientation");
  });

  test("omits menubar role and orientation when composite is false", async ({
    page,
    q,
  }) => {
    const menubar = page.getByLabel("Composite false menubar");
    await test.expect(menubar).toBeAttached();
    await test.expect(menubar).not.toHaveAttribute("role");
    await test.expect(menubar).not.toHaveAttribute("aria-orientation");
    await test.expect(q.menubar("Composite false menubar")).toHaveCount(0);
  });
});
