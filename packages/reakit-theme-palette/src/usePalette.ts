import { useThemeVariable } from "reakit";
import { clamp, toArray } from "./_utils";

export function usePalette(
  palette?: string,
  fallback?: string
): string | undefined {
  const palettes = useThemeVariable("palette");

  if (!palette) return fallback;

  const [color, shade = 0] = palette.split(".");

  if (!(color in palettes)) return fallback;

  const intShade = typeof shade === "number" ? shade : parseInt(shade, 10);

  const shades = toArray(palettes[color]);
  const result =
    intShade < 0
      ? shades[clamp(shades.length + intShade, 0, shades.length - 1)]
      : shades[clamp(intShade, 0, shades.length - 1)];

  if (typeof result === "function") {
    return result();
  }
  return result;
}

export default usePalette;
