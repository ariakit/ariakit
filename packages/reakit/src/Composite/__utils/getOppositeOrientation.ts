import { Orientation } from "./types";

const map = {
  horizontal: "vertical",
  vertical: "horizontal",
  both: "both",
} as const;

export function getOppositeOrientation(orientation?: Orientation) {
  return orientation && (orientation === "both" ? "!both" : map[orientation]);
}
