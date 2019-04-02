import * as React from "react";
import Color from "color";
import { Palette } from "../__utils/types";

export function lighten(
  color?: Palette[string],
  ratio?: number
): Palette[string] {
  if (!ratio) return color;
  if (!color) return undefined;
  if (typeof color === "function") {
    return (palette: Palette) => lighten(color(palette), ratio);
  }
  let _color = Color(color);
  _color =
    _color.lightness() === 0
      ? _color.lightness(ratio * 100) // fix .ligten on black
      : _color.lighten(ratio);
  return _color.hex().toString();
}

export function useLighten(color?: string, ratio?: number) {
  React.useDebugValue(`${color}*${ratio}`);
  return React.useMemo(() => lighten(color, ratio) as string | undefined, [
    color,
    ratio
  ]);
}
