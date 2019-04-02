import * as React from "react";
import Color from "color";

export function isLight(color: string) {
  return Color(color).isLight();
}

export function useIsLight(color: string) {
  React.useDebugValue(color);
  return React.useMemo(() => isLight(color), [color]);
}
