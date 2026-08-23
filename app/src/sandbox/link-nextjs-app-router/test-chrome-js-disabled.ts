import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ id, test }) => {
  test.use({ javaScriptEnabled: false });

  test("serves every disabled boundary in fresh server HTML", async ({
    page,
    q,
  }) => {
    const previous = q.link("Previous dispatch");
    await test.expect(previous).not.toHaveAttribute("href");
    await test.expect(previous).toHaveAttribute("role", "link");
    await test.expect(previous).toHaveAttribute("aria-disabled", "true");
    await test.expect(previous).toHaveAttribute("tabindex", "0");
    await test.expect(previous).not.toHaveAttribute("disabled");

    const ariaDisabled = q.link("ARIA-disabled adapter");
    await test.expect(ariaDisabled).not.toHaveAttribute("href");
    await test.expect(ariaDisabled).toHaveAttribute("aria-disabled", "true");
    await test.expect(ariaDisabled).toHaveAttribute("tabindex", "0");

    const skipped = q.link("Skipped disabled adapter");
    await test.expect(skipped).not.toHaveAttribute("href");
    await test.expect(skipped).toHaveAttribute("tabindex", "-1");

    await test
      .expect(q.link("Disabled handling off"))
      .toHaveAttribute("href", `/${id}/2`);

    await test
      .expect(q.link("Next dispatch"))
      .toHaveAttribute("href", `/${id}/2`);
    await q.link("Next dispatch").click();
    await test.expect(page).toHaveURL(new RegExp(`/${id}/2$`));
    await page.goto(new URL(`/${id}/3`, page.url()).href);
    await test.expect(page).toHaveURL(new RegExp(`/${id}/3$`));

    const next = q.link("Next dispatch");
    await test.expect(next).not.toHaveAttribute("href");
    await test.expect(next).toHaveAttribute("role", "link");
    await test.expect(next).toHaveAttribute("aria-disabled", "true");
    await test.expect(next).toHaveAttribute("tabindex", "0");
    await test.expect(next).not.toHaveAttribute("disabled");
  });
});
