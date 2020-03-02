import { Item } from "./types";

export function groupItemsByRowId(items: Item[]) {
  const rows = [[]] as Item[][];

  for (const item of items) {
    const row = rows.find(
      rowItems => !rowItems[0] || rowItems[0].rowId === item.rowId
    );
    if (row) {
      row.push(item);
    } else {
      rows.push([item]);
    }
  }

  return rows;
}
