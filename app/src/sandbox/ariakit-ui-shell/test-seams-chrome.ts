import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getSidebar, selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ q }) => {
    await selectScenario(q, "geometry");
    await q.button("Toggle layout navigation").click();
    await q.button("Toggle layout contents").click();
    await expect(getSidebar(q, "Layout navigation")).toHaveCSS(
      "width",
      "192px",
    );
    await expect(getSidebar(q, "Layout contents")).toHaveCSS("width", "160px");
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
});
