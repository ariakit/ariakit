import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("panel without tabbable children is focusable", async ({ q }) => {
    const section = query(q.region("Default"));
    await test
      .expect(section.tabpanel("Static"))
      .toHaveAttribute("tabindex", "0");
  });

  test("panel with tabbable children is not focusable after selection", async ({
    q,
  }) => {
    const section = query(q.region("Default"));
    await section.tab("Interactive").click();
    await test
      .expect(section.tabpanel("Interactive"))
      .not.toHaveAttribute("tabindex");
  });

  test("unmountOnHide panel detects tabbable children on selection", async ({
    q,
  }) => {
    const section = query(q.region("Unmount"));
    await section.tab("Interactive").click();
    await test
      .expect(section.tabpanel("Interactive"))
      .not.toHaveAttribute("tabindex");
  });
});
