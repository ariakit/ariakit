import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getSidebar, selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ q }) => {
    await selectScenario(q, "geometry");
    await q.button("Toggle layout navigation").click();
    await q.button("Toggle layout contents").click();
  });

  // https://github.com/ariakit/ariakit/issues/7532
  test("draws each border on its facing side and removes it when disabled", async ({
    q,
  }) => {
    for (const type of ["border", "dashed", "none"]) {
      await q.combobox("Seam type").selectOption(type);
      for (const rtl of [false, true]) {
        await q.checkbox("Right to left").setChecked(rtl);
        const parts = [
          { element: q.banner(), side: "bottom" },
          { element: q.contentinfo(), side: "top" },
          {
            element: q.navigation("Layout navigation"),
            side: rtl ? "left" : "right",
          },
          {
            element: q.navigation("Layout contents"),
            side: rtl ? "right" : "left",
          },
        ];
        for (const { element, side } of parts) {
          await expect(element).toHaveCSS("box-shadow", "none");
          await expect(element).toHaveCSS("border-top-left-radius", "0px");
          for (const edge of ["top", "right", "bottom", "left"]) {
            await expect(element).toHaveCSS(
              `border-${edge}-width`,
              edge === side && type !== "none" ? "2px" : "0px",
            );
          }
          if (type !== "none") {
            await expect(element).toHaveCSS(
              `border-${side}-style`,
              type === "dashed" ? "dashed" : "solid",
            );
          }
        }
      }
    }
    await q.combobox("Seam type").selectOption("border");
    await q.checkbox("Show seams").uncheck();
    for (const element of [
      q.banner(),
      q.contentinfo(),
      q.navigation("Layout navigation"),
      q.navigation("Layout contents"),
    ]) {
      for (const side of ["top", "right", "bottom", "left"]) {
        await expect(element).toHaveCSS(`border-${side}-width`, "0px");
      }
    }
  });

  // https://github.com/ariakit/ariakit/issues/7532
  test("inherits the parent border width and color on every facing side", async ({
    q,
    page,
  }) => {
    await q.checkbox("Inherit seams").check();
    const color = await page
      .locator(".shell")
      .evaluate((node) => getComputedStyle(node).borderBottomColor);
    for (const rtl of [false, true]) {
      await q.checkbox("Right to left").setChecked(rtl);
      const parts = [
        { element: q.banner(), side: "bottom" },
        { element: q.contentinfo(), side: "top" },
        {
          element: q.navigation("Layout navigation"),
          side: rtl ? "left" : "right",
        },
        {
          element: q.navigation("Layout contents"),
          side: rtl ? "right" : "left",
        },
      ];
      for (const { element, side } of parts) {
        await expect(element).toHaveCSS(`border-${side}-width`, "3px");
        await expect(element).toHaveCSS(`border-${side}-color`, color);
      }
    }
  });

  // https://github.com/ariakit/ariakit/issues/7532
  test("resolves a raw edge color from a variable on the public sidebar body", async ({
    q,
  }) => {
    await q.checkbox("Custom sidebar color").check();
    const body = q.navigation("Layout navigation");
    const column = getSidebar(q, "Layout navigation");
    expect(
      await body.evaluate((node) =>
        node.style.getPropertyValue("--sidebar-edge"),
      ),
    ).toBe("rgb(180 40 80)");
    expect(
      await column.evaluate((node) =>
        getComputedStyle(node).getPropertyValue("--sidebar-edge"),
      ),
    ).toBe("");
    for (const rtl of [false, true]) {
      await q.checkbox("Right to left").setChecked(rtl);
      const channels = await body.evaluate((node, rtl) => {
        const style = getComputedStyle(node);
        const color = rtl ? style.borderLeftColor : style.borderRightColor;
        // Raw colors can serialize as oklab. Decode the displayed color rather
        // than require one CSS serialization from every engine.
        const canvas = node.ownerDocument.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Missing canvas context");
        }
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return [...context.getImageData(0, 0, 1, 1).data];
      }, rtl);
      expect(channels).toEqual([180, 40, 80, 255]);
    }
  });

  for (const rtl of [false, true]) {
    // https://github.com/ariakit/ariakit/issues/7532
    test(`keeps both sidebar bodies against their folding edge without reflow in ${rtl ? "RTL" : "LTR"}`, async ({
      q,
    }) => {
      await q.checkbox("Right to left").setChecked(rtl);
      for (const { name, toggle, width, side } of [
        {
          name: "Layout navigation",
          toggle: "Toggle layout navigation",
          width: 192,
          side: "start",
        },
        {
          name: "Layout contents",
          toggle: "Toggle layout contents",
          width: 160,
          side: "end",
        },
      ]) {
        const column = getSidebar(q, name);
        const body = q.navigation(name, { includeHidden: true });
        await expect(column).toHaveCSS("width", `${width}px`);
        const before = await body.evaluate((node) => {
          const link = node.querySelector("a");
          if (!link) {
            throw new Error("Missing sidebar link");
          }
          return {
            width: node.getBoundingClientRect().width,
            linkHeight: link.getBoundingClientRect().height,
          };
        });
        await q.button(toggle).click();
        const samples = await body.evaluate(
          async (node, { rtl, side }) => {
            const column = node.closest(".shell-sidebar");
            const link = node.querySelector("a");
            if (!column || !link) {
              throw new Error("Missing sidebar parts");
            }
            const samples = [];
            const start = performance.now();
            // Sample the fixture's whole 600ms fold. Final closed geometry
            // alone cannot show whether the body detaches or its text reflows
            // midway.
            while (performance.now() - start < 600) {
              const bodyBox = node.getBoundingClientRect();
              const columnBox = column.getBoundingClientRect();
              const edge = (side === "start") !== rtl ? "right" : "left";
              samples.push({
                width: bodyBox.width,
                columnWidth: columnBox.width,
                offset: bodyBox[edge] - columnBox[edge],
                linkHeight: link.getBoundingClientRect().height,
              });
              await new Promise(requestAnimationFrame);
            }
            return samples;
          },
          { rtl, side },
        );
        const folding = samples.filter(
          (sample) =>
            sample.columnWidth > width * 0.1 &&
            sample.columnWidth < width * 0.9,
        );
        expect(folding.length).toBeGreaterThan(0);
        for (const sample of folding) {
          expect(sample.offset).toBeCloseTo(0, 0);
          expect(sample.width).toBeCloseTo(before.width, 0);
          expect(sample.linkHeight).toBeCloseTo(before.linkHeight, 0);
        }
        await expect(column).toHaveCSS("width", "0px");
      }
    });
  }
});
