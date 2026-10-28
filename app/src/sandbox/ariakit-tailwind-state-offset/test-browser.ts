import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

/**
 * Reads the OKLCH lightness and alpha of an element's background, and the
 * lightness of the layer it sits on, which `--ak-layer-parent` holds.
 */
function getColors(element: Locator) {
  return element.evaluate((node) => {
    const style = getComputedStyle(node);
    const parse = (color: string) => {
      const match = /^oklch\(([\d.]+) \S+ \S+(?: \/ ([\d.]+))?\)$/.exec(
        color.trim(),
      );
      if (!match?.[1]) throw new Error(`Not an OKLCH color: ${color}`);
      return { lightness: Number(match[1]), alpha: Number(match[2] ?? 1) };
    };
    const surface = parse(style.backgroundColor);
    return {
      surface: surface.lightness,
      alpha: surface.alpha,
      parent: parse(style.getPropertyValue("--ak-layer-parent")).lightness,
    };
  });
}

withFramework(import.meta.dirname, async ({ query, test }) => {
  // Each layer sits next to the mid-lightness range that colors avoid. The
  // offset at rest flips to skip the range, or the state would enter it. A
  // state that kept the appearance-aware direction of the rest color, or
  // flipped back, would land on the layer color. The state passes how it moves
  // between layer stages through the color alpha, so the hover must also stay
  // opaque.
  test("moves a hovered offset further from its layer", async ({ q }) => {
    for (const [region, name] of [
      ["Darker rest", "Number"],
      ["Darker rest", "Offset"],
      ["Lighter rest", "Number"],
      ["Rest under the range", "Number"],
    ] as const) {
      const button = query(q.region(region)).button(name);
      const rest = await getColors(button);
      await button.hover();
      await expect
        .poll(async () => (await getColors(button)).surface)
        .not.toBe(rest.surface);
      const hovered = await getColors(button);
      const label = `${region}: ${name}`;
      expect(hovered.alpha, label).toBe(1);
      expect(hovered.parent).toBe(rest.parent);
      expect(Math.sign(hovered.surface - hovered.parent), label).toBe(
        Math.sign(rest.surface - rest.parent),
      );
      expect(Math.abs(hovered.surface - hovered.parent), label).toBeGreaterThan(
        Math.abs(rest.surface - rest.parent),
      );
    }
  });

  // The nested button rests on the boundary of the range, one offset from the
  // card, so stopping keeps the rest color and flipping back lands on the card.
  // The state crosses the card instead.
  test("moves a hovered offset that rests on the range away from its layer", async ({
    q,
  }) => {
    const button = query(q.region("Nested rest")).button("Number");
    const rest = await getColors(button);
    await button.hover();
    await expect
      .poll(async () => (await getColors(button)).surface)
      .not.toBe(rest.surface);
    const hovered = await getColors(button);
    expect(Math.abs(hovered.surface - hovered.parent)).toBeGreaterThan(0.03);
    expect(Math.abs(hovered.surface - rest.surface)).toBeGreaterThan(0.03);
  });

  // The press darkens the hovered button into the range. Its state still flips
  // out of the range, and must not land on the layer color.
  test("keeps a pressed offset away from its layer", async ({ page, q }) => {
    const button = query(q.region("Pressed rest")).button("Number");
    const rest = await getColors(button);
    await button.hover();
    await expect
      .poll(async () => (await getColors(button)).surface)
      .not.toBe(rest.surface);
    const hovered = await getColors(button);
    await page.mouse.down();
    await expect
      .poll(async () => (await getColors(button)).surface)
      .not.toBe(hovered.surface);
    const pressed = await getColors(button);
    await page.mouse.up();
    expect(Math.abs(pressed.surface - pressed.parent)).toBeGreaterThan(0.03);
  });

  // A state push moves the state color in its own direction after the state
  // offset, so a reversed state offset would cancel the push.
  test("changes a hovered offset that also pushes", async ({ q }) => {
    const button = query(q.region("Darker rest")).button("Push");
    const rest = await getColors(button);
    await button.hover();
    await expect
      .poll(async () => (await getColors(button)).surface)
      .not.toBe(rest.surface);
    const hovered = await getColors(button);
    expect(Math.abs(hovered.surface - hovered.parent)).toBeGreaterThan(0.03);
    expect(Math.abs(hovered.surface - rest.surface)).toBeGreaterThan(0.03);
  });

  // A negative amount moves the state against the appearance-aware direction of
  // the rest color, which points back to the layer, so the state already moves
  // away from the layer.
  test("keeps a hovered offset with a negative amount away from its layer", async ({
    q,
  }) => {
    const button = query(q.region("Darker rest")).button("Negative");
    const rest = await getColors(button);
    await button.hover();
    await expect
      .poll(async () => (await getColors(button)).surface)
      .not.toBe(rest.surface);
    const hovered = await getColors(button);
    expect(Math.sign(hovered.surface - hovered.parent)).toBe(
      Math.sign(rest.surface - rest.parent),
    );
    expect(Math.abs(hovered.surface - hovered.parent)).toBeGreaterThan(
      Math.abs(rest.surface - rest.parent),
    );
  });

  // The offset moves from the lightened color, so a state that crossed that
  // color would land on the layer color.
  test("keeps a hovered offset on a lightened color away from its layer", async ({
    q,
  }) => {
    const button = query(q.region("Lightened rest")).button("Number");
    const rest = await getColors(button);
    await button.hover();
    await expect
      .poll(async () => (await getColors(button)).surface)
      .not.toBe(rest.surface);
    const hovered = await getColors(button);
    expect(Math.abs(hovered.surface - hovered.parent)).toBeGreaterThan(0.03);
  });

  // The offset moves from the button color, not from the layer color, so the
  // state moves by its amount as it does without an idle offset. A state that
  // crossed the button color would land on the layer color.
  test("keeps a hovered offset on its own color away from its layer", async ({
    q,
  }) => {
    for (const name of ["Color", "Lightness", "Mix"]) {
      const button = query(q.region("Colored rest")).button(name);
      const rest = await getColors(button);
      await button.hover();
      await expect
        .poll(async () => (await getColors(button)).surface)
        .not.toBe(rest.surface);
      const hovered = await getColors(button);
      expect(Math.abs(hovered.surface - rest.surface), name).toBeCloseTo(
        0.06,
        2,
      );
      expect(Math.abs(hovered.surface - hovered.parent), name).toBeGreaterThan(
        0.03,
      );
    }
  });

  // Moving away from the layer would keep the black rest color, so the state
  // keeps the appearance-aware direction.
  test("changes a hovered offset that has no room to move away", async ({
    q,
  }) => {
    const button = query(q.region("Rest without room")).button("Number");
    const rest = await getColors(button);
    await button.hover();
    await expect
      .poll(async () => (await getColors(button)).surface)
      .toBeGreaterThan(rest.surface + 0.03);
  });
});
