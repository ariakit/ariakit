import * as React from "react";
import Color from "color";
import { Palette } from "../__utils/types";

export function darken(
  color?: Palette[string],
  ratio?: number
): Palette[string] {
  if (!ratio) return color;
  if (!color) return undefined;
  if (typeof color === "function") {
    return (palette: Palette) => darken(color(palette), ratio);
  }
  const _color = Color(color);
  const lightness = _color.lightness();
  return _color
    .lightness(lightness - lightness * ratio)
    .hex()
    .toString();
}

export function useDarken(color?: string, ratio?: number) {
  React.useDebugValue(`${color}*${ratio}`);
  return React.useMemo(() => darken(color, ratio) as string | undefined, [
    color,
    ratio
  ]);
}
