import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("select all reflects and toggles its children", async ({ q }) => {
    const box = query(q.article("Select all"));
    const parent = box.checkbox("All features");
    const children = query(box.group("Features"));
    const alerts = children.checkbox("Alerts");
    const analytics = children.checkbox("Analytics");

    await test.expect(parent).toHaveAttribute("aria-checked", "mixed");
    await test.expect(alerts).toBeChecked();
    // The parent names the children it controls.
    const controls = await parent.getAttribute("aria-controls");
    const childIds = await children
      .checkbox()
      .evaluateAll((nodes) => nodes.map((node) => node.id));
    test.expect(controls?.split(" ")).toEqual(childIds);

    await parent.click();
    await test.expect(parent).toBeChecked();
    for (const child of await children.checkbox().all()) {
      await test.expect(child).toBeChecked();
    }

    await parent.click();
    await test.expect(parent).not.toBeChecked();
    for (const child of await children.checkbox().all()) {
      await test.expect(child).not.toBeChecked();
    }

    await analytics.click();
    await test.expect(analytics).toBeChecked();
    await test.expect(parent).toHaveAttribute("aria-checked", "mixed");
  });

  test("a card grid is a named group of cards", async ({ q }) => {
    const box = query(q.article("Card grid"));
    const grid = query(box.group("Features"));
    await test.expect(grid.checkbox()).toHaveCount(4);
    await test.expect(box.text("1 of 4 selected")).toBeVisible();
    // The input is visually hidden, so a user clicks the card around it.
    await grid.text("Alerts").click();
    await test.expect(grid.checkbox("Alerts")).toBeChecked();
    await test.expect(box.text("2 of 4 selected")).toBeVisible();
  });
  // A role prop that is present but undefined, as a wrapper with an optional
  // role passes it, must keep the grid's own group role.
  test("keeps the group role of a card grid whose role prop is undefined", async ({
    q,
  }) => {
    await test.expect(q.group("Optional role")).toBeVisible();
  });
});
