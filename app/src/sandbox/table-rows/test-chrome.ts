import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974212082
  test("keeps edited notes with each contributor after reordering and insertion", async ({
    q,
  }) => {
    await q.textbox("Ada notes").fill("Ready for review");
    await q.textbox("Grace notes").fill("Tests complete");
    await q.button("Reverse rows").click();

    await test.expect(q.cell(/^(Ada|Grace)$/)).toHaveText(["Grace", "Ada"]);
    await test.expect(q.textbox("Ada notes")).toHaveValue("Ready for review");
    await test.expect(q.textbox("Grace notes")).toHaveValue("Tests complete");

    await q.button("Add contributor").click();

    await test
      .expect(q.cell(/^(Ada|Grace|Katherine)$/))
      .toHaveText(["Katherine", "Grace", "Ada"]);
    await test.expect(q.textbox("Katherine notes")).toHaveValue("");
    await test.expect(q.textbox("Ada notes")).toHaveValue("Ready for review");
    await test.expect(q.textbox("Grace notes")).toHaveValue("Tests complete");
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974212082
  test("renders column cells without the reserved row metadata", async ({
    q,
  }) => {
    await test
      .expect(q.columnheader())
      .toHaveText(["Contributor", "Hours", "Notes"]);
    await test.expect(query(q.row(/^Ada /)).cell()).toHaveCount(3);
    await test.expect(query(q.row(/^Grace /)).cell()).toHaveCount(3);
    await test.expect(q.rowheader("Total")).toHaveAttribute("scope", "row");
    await test.expect(query(q.row(/^Total /)).cell()).toHaveCount(2);
  });

  // Explicit zero must not share an identity with an unkeyed row at index zero.
  test("keeps keyed row edits when unkeyed rows change position", async ({
    q,
  }) => {
    await q.textbox("Assigned task notes").fill("Ready to assign");
    await q.button("Reverse task rows").click();

    await test
      .expect(q.cell(/^(Draft|Assigned) task$/))
      .toHaveText(["Assigned task", "Draft task"]);
    await test
      .expect(q.textbox("Assigned task notes"))
      .toHaveValue("Ready to assign");
    await test.expect(q.textbox("Draft task notes")).toHaveValue("Draft");
  });
});
