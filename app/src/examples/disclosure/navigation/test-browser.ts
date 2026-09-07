import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("hover @visual", async ({ q, visual }) => {
    await q.button("Guides").hover();
    await visual();
  });

  test("open @visual", async ({ q, visual }) => {
    await q.button("Guides").click();
    await q.link("Styling & Theming").hover();
    await visual();
  });

  test("click link @visual", async ({ page, q, visual }) => {
    await q.button("Guides").click();
    await q.link("Accessibility").click();
    await test.expect(page).toHaveURL(/\/#\/guides\/accessibility$/);
    await visual();
  });

  test("guide line centred under the icon", async ({ q }) => {
    const button = q.button("Guides");
    await button.click();
    await test.expect(q.link("Styling & Theming")).toBeVisible();
    // The guide is the content's ::before, which no locator can reach, so its
    // box is read from computed styles. The line has no content of its own: it
    // is one border, so the border widths are the line width.
    const measure = (width?: string) =>
      button.evaluate((element, width) => {
        const root = element.parentElement;
        const content = element.nextElementSibling;
        const icon = element.querySelector("svg");
        if (!root || !content || !icon) return null;
        if (width) {
          root.style.setProperty("--disclosure-guide-width", width);
        }
        const line = getComputedStyle(content, "::before");
        const lineWidth =
          parseFloat(line.borderLeftWidth) + parseFloat(line.borderRightWidth);
        const lineStart =
          content.getBoundingClientRect().left +
          content.clientLeft +
          parseFloat(line.left);
        const iconRect = icon.getBoundingClientRect();
        const iconCenter = iconRect.left + iconRect.width / 2;
        return { lineWidth, offset: lineStart + lineWidth / 2 - iconCenter };
      }, width);
    const thin = await measure();
    test.expect(thin?.lineWidth).toBe(1);
    test.expect(thin?.offset).toBeCloseTo(0, 1);
    // A wider line reads its width from the root and stays centred.
    const thick = await measure("3px");
    test.expect(thick?.lineWidth).toBe(3);
    test.expect(thick?.offset).toBeCloseTo(0, 1);
  });
});
