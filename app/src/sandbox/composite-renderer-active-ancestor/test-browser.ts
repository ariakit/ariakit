import { withFramework } from "#app/test-utils/preview.ts";

const cases = [
  {
    label: "generated",
    name: "generated descendant without nested metadata",
  },
  {
    label: "partial-nested",
    name: "generated descendant with partial nested metadata",
  },
  {
    label: "explicit-nested",
    name: "explicit nested item id",
  },
  {
    label: "exact-over-prefix",
    name: "exact item after matching ancestor prefix",
  },
  {
    label: "longest-prefix",
    name: "closest ancestor after shallower prefix",
  },
] as const;

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const { label, name } of cases) {
    test(`renders active item ancestor for ${name}`, async ({ q }) => {
      // The active descendant's ancestor item must be included alongside the
      // virtualized window, so all three items render in order. Each item's
      // visible label ends with its index, so asserting the rendered text in
      // order verifies both the count and the ordering from the user's side.
      const items = query(q.region(label)).button();
      await test
        .expect(items)
        .toHaveText([`${label} item 0`, `${label} item 1`, `${label} item 2`]);
    });
  }
});
