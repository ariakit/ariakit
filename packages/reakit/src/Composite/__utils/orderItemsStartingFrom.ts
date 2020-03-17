import { Item } from "./types";

const nullItem = { id: null, ref: { current: null } };

export function orderItemsStartingFrom(
  items: Item[],
  id: string,
  shouldInsertNullItem?: boolean
) {
  const index = items.findIndex(item => item.id === id);
  return [
    ...items.slice(index + 1),
    ...(shouldInsertNullItem ? [nullItem] : []),
    ...items.slice(0, index)
  ];
}
