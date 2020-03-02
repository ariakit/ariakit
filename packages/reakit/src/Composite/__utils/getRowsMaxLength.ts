import { Item } from "./types";

export function getRowsMaxLength(rows: Item[][]) {
  let maxLength = 0;
  for (const { length } of rows) {
    if (length > maxLength) {
      maxLength = length;
    }
  }
  return maxLength;
}
