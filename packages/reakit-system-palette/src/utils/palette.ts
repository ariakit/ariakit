import * as React from "react";
import { unstable_useToken } from "reakit/system/useToken";
import { Palette } from "../__utils/types";
import { palette as defaultPalette } from "../palette";

export function getPalette(palette = defaultPalette, name?: string) {
  if (!name) return undefined;

  let color = palette[name];

  while (typeof color === "function") {
    color = color(palette);
  }

  return color;
}

export function usePalette(name?: string) {
  React.useDebugValue(name);
  const palette = unstable_useToken<Palette>("palette");
  return getPalette(palette, name);
}
