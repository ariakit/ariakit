import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("nests the semantic ladder under the box title", async ({ q }) => {
    const box = query(q.article("Semantic levels"));
    await test.expect(box.heading("Level three", { level: 3 })).toBeVisible();
    await test.expect(box.heading("Level four", { level: 4 })).toBeVisible();
    await test.expect(box.heading("Level five", { level: 5 })).toBeVisible();
    await test.expect(box.heading("Level six", { level: 6 })).toBeVisible();
  });

  test("keeps the element of a heading whose size changes", async ({ q }) => {
    await test
      .expect(
        query(q.article("Visual level")).heading("An h4 at the h2 size", {
          level: 4,
        }),
      )
      .toBeVisible();
    await test
      .expect(
        query(q.article("Size override")).heading("A small section title", {
          level: 3,
        }),
      )
      .toBeVisible();
  });

  test("links a permalink to its heading", async ({ q }) => {
    const heading = query(q.article("Permalink")).heading("Anchored heading");
    await test
      .expect(query(heading).link("Anchored heading"))
      .toHaveAttribute("href", "#permalink");
  });
});
