import * as React from "react";
import Color from "color";
import { useToken } from "reakit-system/useToken";
import { Palette } from "../__utils/types";
import { getPalette } from "./palette";
import { isLight } from "./isLight";

export function contrastRatio(color1: string, color2: string) {
  return Color(color1).contrast(Color(color2));
}

export function useContrastRatio(color1: string, color2: string) {
  React.useDebugValue(`${color1} - ${color2}`);
  return React.useMemo(() => contrastRatio(color1, color2), [color1, color2]);
}

export function contrast(
  color?: Palette[string]
): (palette: Palette) => string | undefined {
  if (!color) return () => undefined;
  if (typeof color === "function") {
    return (palette: Palette) => contrast(color(palette))(palette);
  }
  const colorIsLight = isLight(color);
  return (palette: Palette) => {
    if (colorIsLight) return getPalette(palette, "black") || "black";
    return getPalette(palette, "white") || "white";
  };
}

export function useContrast(color?: string) {
  React.useDebugValue(color);
  const palette = useToken<Palette>("palette");
  return React.useMemo(() => contrast(color)(palette), [color, palette]);
}
