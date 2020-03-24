import { Item } from "./types";
import { groupItems } from "./groupItems";
import { getMaxLength } from "./getMaxLength";

/**
 * Turns [row1, row1, row2, row2] into [row1, row2, row1, row2]
 */
export function verticalizeItems(items: Item[]) {
  const groups = groupItems(items);
  const maxLength = getMaxLength(groups);
  const verticalized = [] as Item[];

  for (let i = 0; i < maxLength; i += 1) {
    for (const group of groups) {
      if (group[i]) {
        verticalized.push({
          ...group[i],
          groupId: group[i].groupId ? `${i}` : undefined
        });
      }
    }
  }

  return verticalized;
}
