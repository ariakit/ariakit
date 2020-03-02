import { Item } from "./types";

export function flattenRows(rows: Item[][]) {
  const flattened = [] as Item[];
  for (const row of rows) {
    flattened.push(...row);
  }
  return flattened;
}
