import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7114
  test("selects an automatic pointer range without selecting text", async ({
    page,
    q,
  }) => {
    await q.combobox("Field kit gear").click();
    await q.option("Compass").click();
    // Headless engines do not consistently reproduce OS drag selection, so
    // seed the real DOM Selection that the pointer Shift cleanup must clear.
    await q
      .heading("Pack a field kit by range", { level: 1 })
      .evaluate((element) => {
        const selection = element.ownerDocument.getSelection();
        const range = element.ownerDocument.createRange();
        range.selectNodeContents(element);
        selection?.removeAllRanges();
        selection?.addRange(range);
      });
    await test.expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ""))
      .not.toBe("");
    await q.option("Emergency radio").click({ modifiers: ["Shift"] });

    await test
      .expect(q.option("Compass"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(q.option("Headlamp"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(q.option("First-aid kit"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(q.option("Satellite uplink"))
      .toHaveAttribute("aria-selected", "false");
    await test
      .expect(q.status("Field kit selection"))
      .toHaveText(
        "6 packed: Field notebook, Water filter, Compass, Headlamp, First-aid kit, Emergency radio",
      );
    await test.expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ""))
      .toBe("");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  // Firefox's native multi-select wipes prior groups during keyboard ranges.
  // The shared policy keeps the captured base stable while this range reverses.
  test("grows and shrinks an automatic keyboard range", async ({ page, q }) => {
    await q.combobox("Field kit gear").click();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Headlamp")).toHaveAttribute("data-active-item");

    await page.keyboard.press("Shift+ArrowDown");
    await test
      .expect(q.status("Field kit selection"))
      .toHaveText(
        "4 packed: Field notebook, Water filter, Headlamp, First-aid kit",
      );

    await page.keyboard.press("Shift+ArrowUp");
    await test
      .expect(q.status("Field kit selection"))
      .toHaveText("3 packed: Field notebook, Water filter, Headlamp");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("updates the controlled value without private store methods", async ({
    q,
  }) => {
    await q.button("Pack all available gear").click();
    await test
      .expect(q.status("Field kit selection"))
      .toHaveText(
        "9 packed: Compass, Field notebook, Water filter, Headlamp, First-aid kit, Emergency radio, Thermal blanket, Signal mirror, Trail guide",
      );

    await q.button("Clear manifest").click();
    await test
      .expect(q.status("Field kit selection"))
      .toHaveText("Nothing packed yet");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("keeps modified link navigation outside selection", async ({
    page,
    context,
    q,
  }) => {
    await q.combobox("Field kit gear").click();
    const guide = q.option("Trail guide");
    const selection = q.status("Field kit selection");
    const modifier = await page.evaluate(() =>
      navigator.platform.startsWith("Mac") ? "Meta" : "Control",
    );

    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      guide.click({ modifiers: [modifier] }),
    ]);
    await test.expect(newPage).toHaveURL(/#field-kit-notes$/);
    await newPage.close();
    await test.expect(guide).toHaveAttribute("aria-selected", "false");
    await test
      .expect(selection)
      .toHaveText("2 packed: Field notebook, Water filter");

    await guide.click({ modifiers: ["Alt"] });
    await test.expect(guide).toHaveAttribute("aria-selected", "false");
    await test
      .expect(selection)
      .toHaveText("2 packed: Field notebook, Water filter");
  });
});
