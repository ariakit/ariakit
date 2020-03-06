import { Item } from "./types";

export function findEnabledItemById(items: Item[], id: string) {
  return items.find(item => item.id === id && !item.disabled);
}
