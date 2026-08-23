import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ id, test }) => {
  test("navigates with conditional Next Link render elements", async ({
    page,
    q,
  }) => {
    const previous = q.link("Previous dispatch");
    await test.expect(previous).not.toHaveAttribute("href");
    await test.expect(previous).toHaveAttribute("role", "link");
    await test.expect(previous).toHaveAttribute("aria-disabled", "true");
    await test.expect(previous).toHaveAttribute("tabindex", "0");
    await test.expect(previous).not.toHaveAttribute("disabled");

    await test
      .expect(q.link("Next dispatch"))
      .toHaveAttribute("href", `/${id}/2`);
    await q.link("Next dispatch").click();
    await test.expect(page).toHaveURL(new RegExp(`/${id}/2$`));
    await test
      .expect(q.heading("A signal across the plateau", { level: 2 }))
      .toBeVisible();
    await test
      .expect(q.link("Previous dispatch"))
      .toHaveAttribute("href", `/${id}`);
    await test
      .expect(q.link("Next dispatch"))
      .toHaveAttribute("href", `/${id}/3`);
  });

  test("exposes focus loss at the conditional render boundary", async ({
    page,
    q,
  }) => {
    await q.link("Next dispatch").click();
    await test.expect(page).toHaveURL(new RegExp(`/${id}/2$`));
    await test
      .expect(q.heading("A signal across the plateau", { level: 2 }))
      .toBeVisible();

    const before = await q.link("Next dispatch").elementHandle();
    if (!before) {
      throw new Error("Next dispatch link was not rendered");
    }
    await q.link("Next dispatch").click();
    await test.expect(page).toHaveURL(new RegExp(`/${id}/3$`));

    const next = q.link("Next dispatch");
    const after = await next.elementHandle();
    if (!after) {
      throw new Error("Next dispatch link was removed");
    }
    const sameElement = await before.evaluate(
      (element, nextElement) => element === nextElement,
      after,
    );
    test.expect(sameElement).toBe(false);
    await test.expect(next).not.toBeFocused();
    await test.expect(next).not.toHaveAttribute("href");
    await test.expect(next).toHaveAttribute("role", "link");
    await test.expect(next).toHaveAttribute("aria-disabled", "true");
    await test.expect(next).toHaveAttribute("tabindex", "0");
  });

  test("resolves adapter state before choosing the render element", async ({
    q,
  }) => {
    const ariaDisabled = q.link("ARIA-disabled adapter");
    await test.expect(ariaDisabled).not.toHaveAttribute("href");
    await test.expect(ariaDisabled).toHaveAttribute("aria-disabled", "true");
    await test.expect(ariaDisabled).toHaveAttribute("tabindex", "0");

    const skipped = q.link("Skipped disabled adapter");
    await test.expect(skipped).not.toHaveAttribute("href");
    await test.expect(skipped).toHaveAttribute("aria-disabled", "true");
    await test.expect(skipped).toHaveAttribute("tabindex", "-1");

    const inactive = q.link("Disabled handling off");
    await test.expect(inactive).toHaveAttribute("href", `/${id}/2`);
    await test.expect(inactive).not.toHaveAttribute("aria-disabled");
  });
});
