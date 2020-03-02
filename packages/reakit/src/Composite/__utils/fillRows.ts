import { Item } from "./types";
import { getRowsMaxLength } from "./getRowsMaxLength";

/**
 * Turns [[row1, row1], [row2]] into [[row1, row1], [row2, row2]]
 */
export function fillRows(rows: Item[][]) {
  const maxLength = getRowsMaxLength(rows);

  for (const row of rows) {
    if (row.length < maxLength) {
      for (let i = 0; i < maxLength; i += 1) {
        if (!row[i]) {
          row[i] = {
            id: "__EMPTY_ITEM__",
            disabled: true,
            ref: { current: null },
            rowId: row[i - 1].rowId
          };
        }
      }
    }
  }

  return rows;
}
