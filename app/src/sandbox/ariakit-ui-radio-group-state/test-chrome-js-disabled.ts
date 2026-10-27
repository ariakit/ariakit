import { withFramework } from "#app/test-utils/preview.ts";

// Without JavaScript, the page keeps the server markup.
withFramework(import.meta.dirname, async ({ query, test }) => {
  test.use({ javaScriptEnabled: false });

  test("names a group by its label before hydration", async ({ q }) => {
    const group = query(q.radiogroup("Plan"));
    await test.expect(group.radio("Pro")).toBeChecked();
  });

  test("names a card grid by its label before hydration", async ({ q }) => {
    const grid = query(q.radiogroup("Billing"));
    await test.expect(grid.radio("Monthly")).toBeChecked();
  });

  test("names a group by aria-label over its label before hydration", async ({
    q,
  }) => {
    const group = query(q.radiogroup("Color theme"));
    await test.expect(group.radio("Light")).toBeChecked();
  });
});
