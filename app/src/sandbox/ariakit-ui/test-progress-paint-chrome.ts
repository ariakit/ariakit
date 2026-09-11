import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "progress" },
  async ({ test, query }) => {
    // Forced colors repaint every background in the system canvas and drop
    // box-shadows and gradients, which used to leave nothing of a bar or a
    // ring. Only Chromium emulates forced colors.
    test("keeps bars and rings visible in forced colors", async ({
      page,
      q,
    }) => {
      await page.emulateMedia({ forcedColors: "active" });

      const bar = query(q.article("Default")).progressbar(
        "Uploading report.pdf",
      );
      await test.expect(bar).toHaveCSS("outline-style", "solid");
      const barFill = bar.locator(":scope > div");
      const barColors = await barFill.evaluate((node) => {
        const track = node.parentElement;
        return {
          fill: getComputedStyle(node).backgroundColor,
          track: track ? getComputedStyle(track).backgroundColor : "",
        };
      });
      test.expect(barColors.fill).not.toBe(barColors.track);

      const ring = query(q.article("Ring with label")).progressbar(
        "Photo backup",
      );
      await test.expect(ring).toHaveCSS("outline-style", "solid");
      const ringPaint = await ring.evaluate((node) => {
        const fill = node.firstElementChild;
        return {
          arc: fill ? getComputedStyle(fill).backgroundImage : "",
          hole: getComputedStyle(node, "::after").outlineStyle,
        };
      });
      test.expect(ringPaint.arc).toMatch(/^conic-gradient\(/);
      test.expect(ringPaint.hole).toBe("solid");
    });

    // The track's inset ring used to read the border width of the bordered
    // Example box around it, so $border={false} still drew the edge where the
    // edge shows: in high contrast.
    test("draws no edge on a borderless track in high contrast", async ({
      page,
      q,
    }) => {
      await page.emulateMedia({ contrast: "more" });
      const bordered = query(q.article("Default")).progressbar(
        "Uploading report.pdf",
      );
      await test.expect(bordered).toHaveCSS("box-shadow", /1px inset/);
      const borderless = query(q.article("Borderless track")).progressbar(
        "Upload",
      );
      // A ring of zero width can stay in the list; only a visible one fails.
      await test
        .expect(borderless)
        .not.toHaveCSS("box-shadow", /[1-9][\d.]*px inset/);
    });

    // The arc's angular feather used to fade in over the first degree of the
    // sweep, which painted a hairline at 12 o'clock on an empty ring.
    test("paints no arc on an empty ring", async ({ q }) => {
      const ring = query(q.article("Ring at zero")).progressbar("Not started");
      await test.expect(ring).toHaveAttribute("aria-valuenow", "0");
      const arc = ring.locator(":scope > div");
      await test
        .expect(arc)
        .toHaveCSS(
          "background-image",
          /\) 0deg, rgba\(0, 0, 0, 0\) 0deg, rgba\(0, 0, 0, 0\) 360deg\)$/,
        );
    });

    // The arc's angular feather used to fade out over the last degree of the
    // sweep, which left a seam at 12 o'clock on a full ring.
    test("closes a full ring without a seam", async ({ q }) => {
      const ring = query(q.article("Completed ring")).progressbar(
        "Upload complete",
      );
      const arc = ring.locator(":scope > div");
      await test
        .expect(arc)
        .toHaveCSS(
          "background-image",
          /\) 360deg, rgba\(0, 0, 0, 0\) 360deg, rgba\(0, 0, 0, 0\) 360deg\)$/,
        );
    });
  },
);
