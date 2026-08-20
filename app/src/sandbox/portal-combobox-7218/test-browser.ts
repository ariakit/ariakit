import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7218
  test("renders a portal inside fullscreen when defaultView is named", async ({
    page,
    q,
  }) => {
    await q.button("Enter portal fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    await q.button("Mount named form and portal").click();

    await test
      .expect(q.status("Portal result"))
      .toHaveText("Portal parent: fullscreen");
  });

  // https://github.com/ariakit/ariakit/issues/7218
  test("scrolls a selected combobox item when defaultView is named", async ({
    page,
    q,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await q.combobox("Favorite item").click();
    await test.expect(q.option("Item 24")).toBeInViewport();
    await q.button("Scroll selected item with named form").click();

    await test.expect
      .poll(async () => ({
        errors,
        result: await q.status("Combobox result").textContent(),
      }))
      .toEqual({ errors: [], result: "Selected item: visible" });
  });
});
