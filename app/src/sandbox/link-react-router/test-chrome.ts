import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("navigates through a Link-owned router href", async ({ page, q }) => {
    const previous = q.link("Previous entry");
    await test.expect(previous).not.toHaveAttribute("href");
    await test.expect(previous).toHaveAttribute("aria-disabled", "true");
    await test.expect(previous).toHaveAttribute("tabindex", "0");

    await q.link("Next entry").click();
    await test.expect(q.status("Current route")).toHaveText("/page/2");
    await test.expect(page).toHaveURL(/#\/page\/2$/);
    await test.expect(previous).toHaveAttribute("href", "#/page/1");
  });

  test("keeps the focused anchor mounted across route changes", async ({
    q,
  }) => {
    const previous = q.link("Previous entry");
    const before = await previous.elementHandle();
    if (!before) {
      throw new Error("Previous entry link was not rendered");
    }

    await q.button("Move route with previous focused").click();
    const after = await q.link("Previous entry").elementHandle();
    if (!after) {
      throw new Error("Previous entry link was removed");
    }
    const sameElement = await before.evaluate(
      (element, nextElement) => element === nextElement,
      after,
    );
    test.expect(sameElement).toBe(true);
    await test.expect(q.link("Previous entry")).toBeFocused();
    await test
      .expect(q.link("Previous entry"))
      .toHaveAttribute("href", "#/page/1");
  });

  test("respects consumer preventDefault", async ({ page, q }) => {
    const url = page.url();
    await q.link("Try guarded navigation").click();
    await test
      .expect(q.status("Navigation guard"))
      .toHaveText("The consumer kept this route in place.");
    test.expect(page.url()).toBe(url);
  });
});
