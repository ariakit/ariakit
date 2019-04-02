import { Palette } from "../__utils/types";
import { getPalette } from "./palette";

export function ref(name: string, fallback?: string) {
  return (palette: Palette) => getPalette(palette, name) || fallback;
}
