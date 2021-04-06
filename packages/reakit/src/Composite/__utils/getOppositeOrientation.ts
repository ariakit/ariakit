import { Orientation } from "./types";

const map = {
  horizontal: "vertical",
  vertical: "horizontal",
  both: "both",
} as const;

export function getOppositeOrientation(orientation?: Orientation) {
  return orientation && map[orientation];
}
