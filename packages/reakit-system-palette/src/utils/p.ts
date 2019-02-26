import { usePalette } from "./usePalette";

export function p(palette: string, fallback?: string) {
  return () => usePalette(palette, fallback);
}
