import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // A press can't change a selected segment, so the bevel stays the same. The
  // press state isn't in the page captures.
  test("keeps the surface of a selected segment while pressed", async ({
    page,
    q,
  }) => {
    const segment = query(q.radiogroup("Raised")).radio("List");
    const box = await segment.boundingBox();
    if (!box) throw new Error("The segment has no box");
    const surface = () =>
      segment.evaluate((input) => {
        const label = input.closest("label");
        if (!label) return "";
        const { backgroundImage, boxShadow, scale } = getComputedStyle(label);
        return [backgroundImage, boxShadow, scale].join();
      });
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const resting = await surface();
    await page.mouse.down();
    // The surface must not change, so no assertion can wait for it. A press
    // would start within the 100ms --active-duration of the control.
    await page.waitForTimeout(100);
    test.expect(await surface()).toBe(resting);
    await page.mouse.up();
  });

  // The hover state isn't in the page captures.
  test("keeps the offset of a selected segment while hovered", async ({
    page,
    q,
  }) => {
    const segment = query(q.radiogroup("Outlined")).radio("List");
    const color = () =>
      segment.evaluate((input) => {
        const label = input.closest("label");
        if (!label) return "";
        return getComputedStyle(label).backgroundColor;
      });
    const resting = await color();
    await segment.hover();
    // The color must not change, so no assertion can wait for it. The surface
    // has no transition, so the hover state applies on the next frame.
    await flushFrames(page);
    test.expect(await color()).toBe(resting);
  });

  // Text directly in a card takes the color of the label. The hover state isn't
  // in the page captures.
  test("keeps the color of a disabled segment while hovered", async ({
    page,
    q,
  }) => {
    const segment = query(q.radiogroup("Stretched")).radio("Board");
    const color = () =>
      segment.evaluate((input) => {
        const label = input.closest("label");
        if (!label) return "";
        return getComputedStyle(label).color;
      });
    const resting = await color();
    await segment.hover({ force: true });
    // The color must not change, so no assertion can wait for it. The color has
    // no transition, so the hover state applies on the next frame.
    await flushFrames(page);
    test.expect(await color()).toBe(resting);
  });

  test("selects the next segmented tab with an arrow key and shows its panel", async ({
    page,
    q,
  }) => {
    await q.tab("Overview").focus();
    await page.keyboard.press("ArrowRight");
    await test
      .expect(q.tab("Activity"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Activity")).toHaveText("Recent changes");
  });
});
