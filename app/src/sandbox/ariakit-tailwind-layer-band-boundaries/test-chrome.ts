import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("matches exactly one layer band at lightness boundaries", async ({
    q,
  }) => {
    const transparent = "rgba(0, 0, 0, 0)";

    await expect(
      q.text("Dark high candidate (layer lightness 0.275)"),
    ).toHaveCSS("background-color", transparent);
    await expect(
      q.text("Dark low candidate (layer lightness 0.275)"),
    ).toHaveCSS("background-color", "rgb(0, 0, 0)");
    await expect(
      q.text("Light low candidate (layer lightness 0.8575)"),
    ).toHaveCSS("background-color", transparent);
    await expect(
      q.text("Light high candidate (layer lightness 0.8575)"),
    ).toHaveCSS("background-color", "rgb(0, 0, 0)");
  });
});
