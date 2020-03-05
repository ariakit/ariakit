import { Item } from "./types";
import { getMaxLength } from "./getMaxLength";

/**
 * Turns [[row1, row1], [row2]] into [[row1, row1], [row2, row2]]
 */
export function fillGroups(groups: Item[][]) {
  const maxLength = getMaxLength(groups);

  for (const group of groups) {
    if (group.length < maxLength) {
      for (let i = 0; i < maxLength; i += 1) {
        if (!group[i]) {
          group[i] = {
            id: "__EMPTY_ITEM__",
            disabled: true,
            ref: { current: null },
            groupId: group[i - 1].groupId
          };
        }
      }
    }
  }

  return groups;
}
