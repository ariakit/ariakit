import { withFramework } from "#app/test-utils/preview.ts";

// Without JavaScript, the page keeps the server markup, before titles register
// their ids.
withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ javaScriptEnabled: false });

  test("names the code with a title that has an id of its own before hydration", async ({
    q,
  }) => {
    await test.expect(q.region("config.ts")).toBeVisible();
    await test.expect(q.button("Copy config.ts")).toBeVisible();
  });

  test("doesn't refer to a missing title before hydration", async ({
    page,
    q,
  }) => {
    // Only the block with a title part is a region.
    await test.expect(q.region()).toHaveCount(1);
    const missing = await page.evaluate(() =>
      [...document.querySelectorAll("[aria-labelledby]")].flatMap((element) =>
        (element.getAttribute("aria-labelledby") ?? "")
          .split(" ")
          .filter((id) => !document.getElementById(id)),
      ),
    );
    test.expect(missing).toEqual([]);
  });
});
