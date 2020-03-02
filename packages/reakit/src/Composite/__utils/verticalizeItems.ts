import { Item } from "./types";
import { groupItemsByRowId } from "./groupItemsByRowId";
import { getRowsMaxLength } from "./getRowsMaxLength";

/**
 * Turns [row1, row1, row2, row2] into [row1, row2, row1, row2]
 */
export function verticalizeItems(items: Item[]) {
  const rows = groupItemsByRowId(items);
  const maxLength = getRowsMaxLength(rows);
  const verticalized = [] as Item[];

  for (let i = 0; i < maxLength; i += 1) {
    for (const row of rows) {
      if (row[i]) {
        verticalized.push({
          ...row[i],
          rowId: `${i}`
        });
      }
    }
  }

  return verticalized;
}
