import { expect, test } from "vitest";
import { layer } from "./layer.ts";

// Regression coverage: the numeric $chroma, $chromaMin, and $chromaMax
// branches once wrote the same custom property, so combining any two
// silently clobbered the base chroma with the min or max value.
test("keeps numeric chroma, min, and max on distinct properties", () => {
  const { class: className, style } = layer.html({
    $chroma: 20,
    $chromaMin: 10,
    $chromaMax: 30,
  });
  expect(className).toContain("ak-layer-c-(--layer-chroma)");
  expect(className).toContain("ak-layer-min-c-(--layer-chroma-min)");
  expect(className).toContain("ak-layer-max-c-(--layer-chroma-max)");
  expect(style).toBe(
    "--layer-chroma: calc((20) / 100); " +
      "--layer-chroma-min: calc((10) / 100); " +
      "--layer-chroma-max: calc((30) / 100);",
  );
});
