import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // examples/select-grid/test.ts
  test("uses the center as the default value", async ({ q }) => {
    await test.expect(q.combobox("Position")).toHaveText("Center");
    await q.combobox("Position").click();
    await test.expect(q.grid()).toBeVisible();
    await test.expect(q.gridcell("Center")).toHaveAttribute("data-active-item");
  });

  // examples/select-grid/test.ts
  test("changes an expanded value with the keyboard", async ({ page, q }) => {
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowUp");
    await test
      .expect(q.gridcell("Top Center"))
      .toHaveAttribute("data-active-item");
    await page.keyboard.press("ArrowLeft");
    await test
      .expect(q.gridcell("Top Left"))
      .toHaveAttribute("data-active-item");
    await page.keyboard.press("End");
    await test
      .expect(q.gridcell("Top Right"))
      .toHaveAttribute("data-active-item");
    await page.keyboard.press("Control+End");
    await test
      .expect(q.gridcell("Bottom Right"))
      .toHaveAttribute("data-active-item");
    await page.keyboard.press("Home");
    await test
      .expect(q.gridcell("Bottom Left"))
      .toHaveAttribute("data-active-item");
    await page.keyboard.press("Control+Home");
    await test
      .expect(q.gridcell("Top Left"))
      .toHaveAttribute("data-active-item");
    await page.keyboard.type("tt");
    await test
      .expect(q.gridcell("Top Right"))
      .toHaveAttribute("data-active-item");
    await page.keyboard.press("Escape");
    await test.expect(q.grid()).not.toBeVisible();
    await test.expect(q.combobox("Position")).toHaveText("Center");
    await page.keyboard.press("Space");
    await page.keyboard.type("top right");
    await page.keyboard.press("Enter");
    await test.expect(q.combobox("Position")).toHaveText("Top Right");
  });

  // examples/select-grid/test.ts
  test("changes a collapsed value with the keyboard", async ({ page, q }) => {
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.grid()).not.toBeVisible();
    await test.expect(q.combobox("Position")).toHaveText("Bottom Center");
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.combobox("Position")).toHaveText("Bottom Left");
    await page.keyboard.press("ArrowUp");
    await test.expect(q.combobox("Position")).toHaveText("Center Left");
    await page.keyboard.press("ArrowUp");
    await test.expect(q.combobox("Position")).toHaveText("Top Left");
    await page.keyboard.type("cc");
    await test.expect(q.combobox("Position")).toHaveText("Center");
    await page.waitForTimeout(600);
    await page.keyboard.type("bbb");
    await test.expect(q.combobox("Position")).toHaveText("Bottom Right");
    await page.keyboard.press("Enter");
    await test.expect(q.grid()).toBeVisible();
    await test
      .expect(q.gridcell("Bottom Right"))
      .toHaveAttribute("data-active-item");
  });

  // examples/select-grid/test.ts
  test("changes the value on hover", async ({ page, q }) => {
    await q.combobox("Position").click();
    await q.gridcell("Top Left").hover();
    await test
      .expect(q.gridcell("Top Left"))
      .toHaveAttribute("data-active-item");
    await test.expect(q.combobox("Position")).toHaveText("Top Left");
    await q.gridcell("Top Center").hover();
    await test
      .expect(q.gridcell("Top Center"))
      .toHaveAttribute("data-active-item");
    await test.expect(q.combobox("Position")).toHaveText("Top Center");
    await page.locator("body").hover({ position: { x: 0, y: 0 } });
    await test
      .expect(q.gridcell("Top Center"))
      .toHaveAttribute("data-active-item");
    await page.locator("body").click({ position: { x: 0, y: 0 } });
    await test.expect(q.grid()).not.toBeVisible();
    await test.expect(q.combobox("Position")).toHaveText("Top Center");
  });

  // examples/select-grid/test.ts
  test("keeps the moved value when tabbing out", async ({ page, q }) => {
    await page.evaluate(() => {
      const target = document.createElement("div");
      target.dataset.testTarget = "";
      target.tabIndex = 0;
      document.body.appendChild(target);
    });

    await q.combobox("Position").click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Tab");
    await test.expect(q.grid()).not.toBeVisible();
    await test.expect(q.combobox("Position")).toHaveText("Bottom Center");
  });
});
