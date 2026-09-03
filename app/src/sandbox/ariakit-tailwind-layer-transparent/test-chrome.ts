import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// `ak-layer-transparent` scales the layer color's alpha instead of replacing
// the color, so Chrome keeps the OKLCH channels and serializes an unpainted
// element as `oklch(<l> <c> <h> / 0)`.
const UNPAINTED = /\/ 0\)$/;

function getBackgroundColor(locator: Locator) {
  return locator.evaluate((element) => {
    return window.getComputedStyle(element).backgroundColor;
  });
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("paints nothing until a modifier moves the layer color", async ({
    q,
  }) => {
    await expect(q.button("Resting ghost")).toHaveCSS(
      "background-color",
      UNPAINTED,
    );
    // Bare `ak-layer` must keep painting: the new utility is opt-in.
    await expect(q.button("Plain layer")).not.toHaveCSS(
      "background-color",
      UNPAINTED,
    );
    const painted = await getBackgroundColor(q.button("Modified control"));
    await expect(q.button("Modified ghost")).toHaveCSS(
      "background-color",
      painted,
    );
    // Only the background is gated. Both buttons resolve the same layer, so
    // the edge the utility leaves alone must still match.
    const edge = await q
      .button("Plain layer")
      .evaluate((element) => window.getComputedStyle(element).borderTopColor);
    await expect(q.button("Resting ghost")).toHaveCSS("border-top-color", edge);
  });

  test("keeps a translucent layer translucent once it paints", async ({
    q,
  }) => {
    const painted = await getBackgroundColor(q.button("Translucent control"));
    await expect(q.button("Translucent ghost")).toHaveCSS(
      "background-color",
      painted,
    );
  });

  test("paints while a state variant carries a modifier", async ({
    page,
    q,
  }) => {
    const ghost = q.button("Hovered ghost");
    await expect(ghost).toHaveCSS("background-color", UNPAINTED);

    const control = q.button("Hovered control");
    const resting = await getBackgroundColor(control);
    await control.hover();
    // Retry until the hover state paints, so the reference read below cannot
    // capture the resting color.
    await expect(control).not.toHaveCSS("background-color", resting);
    const hovered = await getBackgroundColor(control);

    await ghost.hover();
    await expect(ghost).toHaveCSS("background-color", hovered);

    await page.mouse.move(0, 0);
    await expect(ghost).toHaveCSS("background-color", UNPAINTED);
  });

  test("paints while a class-gated modifier applies", async ({ q }) => {
    const ghost = q.button("Pin ghost");
    const control = q.button("Pin control");
    await expect(ghost).toHaveCSS("background-color", UNPAINTED);

    await ghost.click();
    // Both buttons read the same state, so wait for it before the reference
    // read below.
    await expect(control).toHaveAttribute("aria-pressed", "true");
    const pressed = await getBackgroundColor(control);
    await expect(ghost).toHaveCSS("background-color", pressed);
  });

  test("keeps a control unpainted through a state that carries no modifier", async ({
    page,
    q,
  }) => {
    // The glider these controls sit over is only visible because they paint
    // nothing, selected or not.
    await expect(page.locator("[data-glider]")).not.toHaveCSS(
      "background-color",
      UNPAINTED,
    );
    for (const name of ["Overview", "Activity", "Settings"]) {
      await expect(q.button(name)).toHaveCSS("background-color", UNPAINTED);
    }

    await q.button("Settings").click();
    await expect(q.button("Settings")).toHaveAttribute("aria-pressed", "true");
    // The click leaves the pointer on the control, and hover paints on purpose.
    await page.mouse.move(0, 0);
    await expect(q.button("Settings")).toHaveCSS("background-color", UNPAINTED);
  });
});
