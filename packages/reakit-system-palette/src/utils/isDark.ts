import * as React from "react";
import Color from "color";

export function isDark(color: string) {
  return Color(color).isDark();
}

export function useIsDark(color: string) {
  React.useDebugValue(color);
  return React.useMemo(() => isDark(color), [color]);
}
