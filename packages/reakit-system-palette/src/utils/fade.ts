import * as React from "react";
import Color from "color";
import { Palette } from "../__utils/types";

export function fade(color?: Palette[string], ratio?: number): Palette[string] {
  if (!ratio) return color;
  if (!color) return undefined;
  if (typeof color === "function") {
    return (palette: Palette) => fade(color(palette), ratio);
  }
  return Color(color)
    .fade(ratio)
    .rgb()
    .toString();
}

export function useFade(color?: string, ratio?: number) {
  React.useDebugValue(`${color}*${ratio}`);
  return React.useMemo(() => fade(color, ratio) as string | undefined, [
    color,
    ratio
  ]);
}
