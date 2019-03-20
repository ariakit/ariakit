export function removeIndexFromArray<A extends any[]>(array: A, idx: number) {
  if (idx === -1) return array;
  return [...array.slice(0, idx), ...array.slice(idx + 1)] as A;
}
