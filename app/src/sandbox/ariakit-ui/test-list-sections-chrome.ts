import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "list" },
  async ({ test, query }) => {
    // Sections mode used to match only h1 to h4, so a list deep in the outline
    // fell back to the tighter blocks rhythm.
    test("uses the sections rhythm for h5 headings", async ({ q }) => {
      const deep = query(q.article("Deep sections"));
      await test
        .expect(deep.heading("Two-factor sign-in", { level: 5 }))
        .toBeVisible();
      const shallow = query(q.article("Sections"));
      await test.expect(shallow.heading("Account", { level: 3 })).toBeVisible();

      const getRowGap = (scope: typeof deep) =>
        scope.list().evaluate((node) => getComputedStyle(node).rowGap);
      const sectionsGap = await getRowGap(shallow);
      test.expect(sectionsGap).not.toBe("0px");
      test.expect(await getRowGap(deep)).toBe(sectionsGap);
    });
  },
);
