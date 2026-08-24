import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7114
  test("contains pointer ranges to selectable rows", async ({ q }) => {
    const grid = q.grid("Launch portfolio");
    await test.expect(grid).toHaveAttribute("aria-multiselectable", "true");

    await q.gridcell("Atlas owner").click();
    await q.gridcell("Lumen status").click({ modifiers: ["Shift"] });

    for (const name of ["Atlas", "Beacon", "Lumen"]) {
      await test
        .expect(q.row(`${name} project`))
        .toHaveAttribute("aria-selected", "true");
    }
    await test
      .expect(q.gridcell("Lumen status"))
      .not.toHaveAttribute("aria-selected");
    await test
      .expect(q.status("Grid selection"))
      .toHaveText("3 selected: Atlas, Beacon, Lumen");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("uses grid navigation for row selection ranges", async ({ q }) => {
    await q.button("Clear projects").click();
    await q.gridcell("Beacon owner").click();
    await q.gridcell("Beacon owner").press("Shift+ArrowRight");
    await test.expect(q.gridcell("Beacon status")).toBeFocused();
    await test
      .expect(q.status("Grid selection"))
      .toHaveText("1 selected: Beacon");

    await q.gridcell("Beacon status").press("Shift+ArrowDown");
    await test.expect(q.gridcell("Lumen status")).toBeFocused();
    await test
      .expect(q.status("Grid selection"))
      .toHaveText("2 selected: Beacon, Lumen");

    await q.gridcell("Lumen status").press("ControlOrMeta+a");
    await test
      .expect(q.status("Grid selection"))
      .toHaveText("6 selected: Beacon, Lumen, Atlas, Nova, Orbit, Prism");
    await test
      .expect(q.gridcell("Prism updated"))
      .not.toHaveAttribute("data-selected");
  });
});
