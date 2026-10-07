import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/7750
  test("keeps the portal element in its place when the prop changes to null and back", async ({
    q,
  }) => {
    const workspace = query(q.region("Workspace"));
    const dock = workspace.group("Dock");
    await test.expect(query(dock).text("Notes")).toBeVisible();

    await q.button("Undock notes").click();
    await test.expect(q.button("Dock notes")).toBeVisible();
    // The notes move to the default portal node, outside the workspace. The
    // dock is an element of the app, so it stays in the workspace.
    await test.expect(q.text("Notes")).toBeVisible();
    await test.expect(workspace.text("Notes")).toHaveCount(0);
    await test.expect(dock).toBeVisible();

    await q.button("Dock notes").click();
    await test.expect(q.button("Undock notes")).toBeVisible();
    await test.expect(query(dock).text("Notes")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7750
  test("lets the app remove the portal element after the prop changed to null", async ({
    q,
  }) => {
    await q.button("Undock notes").click();
    await test.expect(q.button("Dock notes")).toBeVisible();

    await q.button("Remove dock").click();
    // React removes the dock from the workspace. The workspace still renders,
    // and the notes stay in the default portal node.
    await test.expect(q.button("Dock notes")).toBeVisible();
    await test.expect(q.text("Notes")).toBeVisible();
    await test.expect(q.group("Dock")).toHaveCount(0);
  });
});
