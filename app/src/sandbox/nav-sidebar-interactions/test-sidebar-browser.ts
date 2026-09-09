import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const direction of ["LTR", "RTL"]) {
    for (const [name, side] of [
      ["Default start", "start"],
      ["Direct end", "end"],
      ["Provider end", "end"],
      ["Override start", "start"],
    ] as const) {
      const label = `${direction} ${name}`;
      // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781708
      test(`positions and closes ${label} at its logical edge`, async ({
        q,
      }) => {
        const panel = q.complementary(`${label} panel`, {
          includeHidden: true,
        });
        const canvas = q.region(`${label} canvas`);
        const isRight = (side === "end") === (direction === "LTR");
        await q.button(`Toggle ${label}`).click();
        await test.expect(panel).toBeVisible();
        await test.expect(panel).toHaveCSS("translate", "none");
        await test
          .expect(panel)
          .toHaveCSS(
            "border-inline-start-width",
            side === "end" ? "1px" : "0px",
          );
        await test
          .expect(panel)
          .toHaveCSS(
            "border-inline-end-width",
            side === "start" ? "1px" : "0px",
          );
        await test.expect
          .poll(async () => {
            const panelBox = await panel.boundingBox();
            const canvasBox = await canvas.boundingBox();
            if (!panelBox || !canvasBox) return Infinity;
            return isRight
              ? panelBox.x + panelBox.width - canvasBox.x - canvasBox.width
              : panelBox.x - canvasBox.x;
          })
          .toBeCloseTo(0, 0);

        await q.button(`Close ${label}`).click();
        await test
          .expect(panel)
          .toHaveCSS("translate", isRight ? "100%" : "-100%");
        await test.expect(panel).toBeHidden();
      });
    }
  }
});
