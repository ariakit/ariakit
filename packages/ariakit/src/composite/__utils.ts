import { RefObject, createContext } from "react";
import { getDocument, isTextField } from "ariakit-utils/dom";
import { createStoreContext } from "ariakit-utils/store";
import { CompositeState } from "./composite-state";

const NULL_ITEM = { id: null, ref: { current: null } };

function getMaxRowLength(array: Item[][]) {
  let maxLength = 0;
  for (const { length } of array) {
    if (length > maxLength) {
      maxLength = length;
    }
  }
  return maxLength;
}

/**
 * Returns only enabled items.
 */
export function getEnabledItems(items: Item[], excludeId?: string) {
  return items.filter((item) => {
    if (excludeId) {
      return !item.disabled && item.id !== excludeId;
    }
    return !item.disabled;
  });
}

/**
 * Finds the first enabled item.
 */
export function findFirstEnabledItem(items: Item[], excludeId?: string) {
  return items.find((item) => {
    if (excludeId) {
      return !item.disabled && item.id !== excludeId;
    }
    return !item.disabled;
  });
}

/**
 * Fills rows with fewer items with empty items so they all have the same
 * length.
 */
export function normalizeRows(
  rows: Item[][],
  activeId?: string | null,
  focusShift?: boolean
) {
  const maxLength = getMaxRowLength(rows);
  for (const row of rows) {
    for (let i = 0; i < maxLength; i += 1) {
      const item = row[i];
      if (!item || (focusShift && item.disabled)) {
        const isFirst = i === 0;
        const previousItem =
          isFirst && focusShift ? findFirstEnabledItem(row) : row[i - 1];
        row[i] =
          previousItem && activeId !== previousItem.id && focusShift
            ? previousItem
            : createEmptyItem(previousItem?.rowId);
      }
    }
  }
  return rows;
}

function createEmptyItem(rowId?: string) {
  return {
    id: "__EMPTY_ITEM__",
    disabled: true,
    ref: { current: null },
    rowId,
  };
}

/**
 * Finds the first enabled item by its id.
 */
export function findEnabledItemById(items: Item[], id?: string | null) {
  if (!id) return;
  return items.find((item) => item.id === id && !item.disabled);
}

/**
 * Gets the active id. If `passedId` is provided, it's going to take
 * precedence.
 */
export function getActiveId(
  items: Item[],
  activeId?: string | null,
  passedId?: string | null
) {
  if (passedId !== undefined) {
    return passedId;
  }
  if (activeId !== undefined) {
    return activeId;
  }
  return findFirstEnabledItem(items)?.id;
}

/**
 * Gets all items with the passed rowId.
 */
export function getItemsInRow(items: Item[], rowId?: string) {
  return items.filter((item) => item.rowId === rowId);
}

/**
 * Gets the opposite orientation.
 */
export function getOppositeOrientation(orientation: Orientation) {
  if (orientation === "vertical") return "horizontal" as const;
  if (orientation === "horizontal") return "vertical" as const;
  return;
}

/**
 * Creates a two-dimensional array with items grouped by their rowId's.
 */
export function groupItemsByRows(items: Item[]) {
  const rows: Item[][] = [];
  for (const item of items) {
    const row = rows.find((currentRow) => currentRow[0]?.rowId === item.rowId);
    if (row) {
      row.push(item);
    } else {
      rows.push([item]);
    }
  }
  return rows;
}

/**
 * Moves all the items before the passed `id` to the end of the array. This is
 * useful when we want to loop through the items in the same row or column as
 * the first items will be placed after the last items.
 *
 * The null item that's inserted when `shouldInsertNullItem` is set to `true`
 * represents the composite container itself. When the active item is null, the
 * composite container has focus.
 */
export function flipItems(
  items: Item[],
  activeId: string,
  shouldInsertNullItem = false
) {
  const index = items.findIndex((item) => item.id === activeId);
  return [
    ...items.slice(index + 1),
    ...(shouldInsertNullItem ? [NULL_ITEM] : []),
    ...items.slice(0, index),
  ];
}

/**
 * Changes the order of the items list so they are ordered vertically. That is,
 * if the active item is the first item in the first row, the next item will be
 * the first item in the second row, which is what you would expect when moving
 * up/down.
 */
export function verticalizeItems(items: Item[]) {
  const rows = groupItemsByRows(items);
  const maxLength = getMaxRowLength(rows);
  const verticalized: Item[] = [];
  for (let i = 0; i < maxLength; i += 1) {
    for (const row of rows) {
      const item = row[i];
      if (item) {
        verticalized.push({
          ...item,
          // If there's no rowId, it means that it's not a grid composite, but
          // a single row instead. So, instead of verticalizing it, that is,
          // assigning a different rowId based on the column index, we keep it
          // undefined so they will be part of the same row. This is useful
          // when using up/down on one-dimensional composites.
          rowId: item.rowId ? `${i}` : undefined,
        });
      }
    }
  }
  return verticalized;
}

/**
 * Gets item id.
 */
export function getContextId(
  state?: Pick<CompositeState, "baseRef">,
  context?: ItemContext
) {
  return context?.baseRef && context.baseRef === state?.baseRef
    ? context.id
    : undefined;
}

export function selectTextField(element: HTMLElement, collapseToEnd = false) {
  if (isTextField(element)) {
    element.setSelectionRange(
      collapseToEnd ? element.value.length : 0,
      element.value.length
    );
  } else if (element.isContentEditable) {
    const selection = getDocument(element).getSelection();
    selection?.selectAllChildren(element);
    if (collapseToEnd) {
      selection?.collapseToEnd();
    }
  }
}

export const CompositeContext = createStoreContext<CompositeState>();

type ItemContext =
  | { baseRef?: RefObject<HTMLElement>; id?: string }
  | undefined;

export const CompositeRowContext = createContext<ItemContext>(undefined);
export const CompositeItemContext = createContext<ItemContext>(undefined);

export type Orientation = "horizontal" | "vertical" | "both";

export type Item = {
  id: string | null;
  ref: RefObject<HTMLElement>;
  rowId?: string;
  disabled?: boolean;
};
