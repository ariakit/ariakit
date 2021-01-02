import { Orientation } from "./types";

const map = {
  horizontal: "vertical",
  vertical: "horizontal",
} as const;

export function getOppositeOrientation(orientation?: Exclude<Orientation, "both">) {
  return orientation && map[orientation];
}
