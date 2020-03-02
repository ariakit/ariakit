import { Item } from "./types";

export function findDOMIndex(items: Item[], item: Item) {
  return items.findIndex(currentItem => {
    if (!currentItem.ref.current || !item.ref.current) {
      return false;
    }
    // Returns true if the new item is located earlier in the DOM compared
    // to the current item in the iteration.
    return Boolean(
      currentItem.ref.current.compareDocumentPosition(item.ref.current) &
        Node.DOCUMENT_POSITION_PRECEDING
    );
  });
}
