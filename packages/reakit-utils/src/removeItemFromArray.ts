import { removeIndexFromArray } from "./removeIndexFromArray";

export function removeItemFromArray<A extends any[]>(
  array: A,
  item: A[number]
) {
  const idx = array.indexOf(item);
  return removeIndexFromArray(array, idx);
}
