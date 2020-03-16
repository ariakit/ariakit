import { Item } from "./types";

export function orderItemsStartingFrom(
  items: Item[],
  id: string,
  lol?: boolean
) {
  const index = items.findIndex(item => item.id === id);
  return [
    ...items.slice(index + 1),
    ...(lol
      ? [{ id: (null as unknown) as string, ref: { current: null } }]
      : []),
    ...items.slice(0, index)
  ];
}
