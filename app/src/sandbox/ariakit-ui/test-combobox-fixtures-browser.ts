import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "combobox-fixtures" },
  async ({ test, query }) => {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
    test("keeps popover spacing with optional position props", async ({
      q,
    }) => {
      // The old sandbox rendered this section at the top of a bare page. Here
      // the gallery header comes first, so scroll the section to the top of the
      // viewport: the popovers then have room to open below their anchors
      // instead of flipping above them.
      await q.region("Project editor").evaluate((node) => {
        node.scrollIntoView({ block: "start" });
      });
      const input = q.combobox("Assignee");
      await input.click();
      const inputBox = await input.boundingBox();
      test.expect(inputBox).not.toBeNull();
      if (!inputBox) return;
      await test.expect
        .poll(async () => {
          const box = await q.listbox("Assignee").boundingBox();
          return box && Math.round(box.y - inputBox.y - inputBox.height);
        })
        .toBe(8);
      await test
        .expect(query(q.region("Project editor")).listbox())
        .toHaveCount(0);
      await input.press("Escape");
      const select = q.combobox("Status");
      await select.click();
      const selectBox = await select.boundingBox();
      test.expect(selectBox).not.toBeNull();
      if (!selectBox) return;
      await test.expect
        .poll(async () => {
          const box = await q.listbox("Status").boundingBox();
          return box && Math.round(box.y - selectBox.y - selectBox.height);
        })
        .toBe(8);
      await test.expect
        .poll(async () => {
          const box = await q.listbox("Status").boundingBox();
          return box && Math.round(box.x - selectBox.x);
        })
        .toBe(-3);
    });
  },
);
