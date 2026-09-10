import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const [name, label] of [
    ["Custom", "Menu"],
    ["Zero", "0"],
  ] as const) {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781705
    test(`preserves ${name} sidebar toggle content when opening and closing`, async ({
      q,
    }) => {
      const toggle = query(
        q.region(`${name} toggle`, { includeHidden: true }),
      ).button(label, { includeHidden: true });
      await test.expect(toggle).toHaveText(label);
      await test.expect(toggle).toHaveAttribute("aria-expanded", "false");
      await toggle.click();
      await test.expect(q.link(`${name} settings`)).toBeVisible();
      await test.expect(toggle).toHaveText(label);
      await q.button(`Close ${name} menu`).click();
      await test.expect(q.link(`${name} settings`)).toBeHidden();
      await test.expect(toggle).toHaveText(label);
    });
  }

  test("keeps the state label when sidebar toggle children are absent", async ({
    q,
  }) => {
    const section = query(q.region("Fallback toggle", { includeHidden: true }));
    await section.button("Expand sidebar").click();
    await test.expect(q.link("Fallback settings")).toBeVisible();
    await test
      .expect(section.button("Collapse sidebar", { includeHidden: true }))
      .toHaveAttribute("aria-expanded", "true");
    await q.button("Close Fallback menu").click();
    await test.expect(section.button("Expand sidebar")).toBeVisible();
  });

  test("reads the sidebar toggle label from its explicit store", async ({
    q,
  }) => {
    const section = query(
      q.region("Explicit store toggle", { includeHidden: true }),
    );
    await section.button("Expand sidebar").click();
    await test.expect(q.link("Explicit store settings")).toBeVisible();
    await test
      .expect(section.button("Collapse sidebar", { includeHidden: true }))
      .toHaveAttribute("aria-expanded", "true");
    await q.button("Close explicit store menu").click();
    await test.expect(section.button("Expand sidebar")).toBeVisible();
  });
});
