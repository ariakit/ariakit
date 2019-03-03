// TODO: Refactor
import * as React from "react";
import { unstable_useToken } from "reakit/system/useToken";

function toArray<T>(arg: T[] | T) {
  return Array.isArray(arg) ? arg : [arg];
}

function clamp(number: number, min: number, max: number) {
  if (number < min) return min;
  if (number > max) return max;
  return number;
}

type Palette = {
  [key: string]: string | string[] | (() => string) | Array<() => string[]>;
};

export function usePalette(
  palette?: string,
  fallback?: string
): string | undefined {
  React.useDebugValue(palette || "(not set)");
  const palettes = unstable_useToken<Palette>("palette");

  if (!palette || !palettes) return fallback;

  const [color, shade = 0] = palette.split(".");

  if (!(color in palettes)) return fallback;

  const intShade = typeof shade === "number" ? shade : parseInt(shade, 10);

  const shades = toArray(
    // @ts-ignore
    typeof palettes[color] === "function" ? palettes[color]() : palettes[color]
  );
  const result =
    intShade < 0
      ? shades[clamp(shades.length + intShade, 0, shades.length - 1)]
      : shades[clamp(intShade, 0, shades.length - 1)];

  if (typeof result === "function") {
    return result();
  }
  return result;
}
