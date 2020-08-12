import { Item } from "./types";
import { getMaxLength } from "./getMaxLength";
import { findFirstEnabledItem } from "./findFirstEnabledItem";

function createEmptyItem(groupId?: string) {
  return {
    id: "__EMPTY_ITEM__",
    disabled: true,
    ref: { current: null },
    groupId,
  };
}

/**
 * Turns [[row1, row1], [row2]] into [[row1, row1], [row2, row2]]
 */
export function fillGroups(
  groups: Item[][],
  currentId?: string | null,
  angular?: boolean
) {
  const maxLength = getMaxLength(groups);

  for (const group of groups) {
    for (let i = 0; i < maxLength; i += 1) {
      const item = group[i];
      if (!item || (angular && item.disabled)) {
        const isFrist = i === 0;
        const previousItem =
          isFrist && angular ? findFirstEnabledItem(group) : group[i - 1];
        group[i] =
          previousItem && currentId !== previousItem?.id && angular
            ? previousItem
            : createEmptyItem(previousItem?.groupId);
      }
    }
  }

  return groups;
}
