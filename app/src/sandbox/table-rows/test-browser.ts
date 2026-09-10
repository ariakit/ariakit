import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
  test("inherits and updates column styles across the head, body, and footer", async ({
    q,
  }) => {
    const names = [
      q.columnheader("Contributor"),
      q.cell("Ada"),
      q.cell("Grace"),
      q.rowheader("Total"),
    ];
    const hours = [
      q.columnheader("Hours"),
      q.cell("12"),
      q.cell("7"),
      q.cell("19"),
    ];

    for (const cell of names) {
      await test.expect(cell).toHaveCSS("position", "sticky");
      await test.expect(cell).toHaveCSS("inset-inline-start", "0px");
    }
    for (const cell of hours) {
      await test.expect(cell).toHaveCSS("text-align", "end");
      await test.expect(cell).toHaveCSS("white-space", "nowrap");
    }
    await test.expect(q.rowheader("Total")).toHaveCSS("text-align", "end");
    await test
      .expect(q.columnheader("Contributor"))
      .toHaveCSS("text-align", "start");

    await q.checkbox("Pin contributor names").uncheck();

    for (const cell of names) {
      await test.expect(cell).toHaveCSS("position", "static");
    }
    for (const cell of hours) {
      await test.expect(cell).toHaveCSS("text-align", "end");
    }
  });
});
