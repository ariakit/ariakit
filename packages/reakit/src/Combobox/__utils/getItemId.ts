export function getItemId(baseId: string, value: string, id?: string) {
  return id || `${baseId}-${value}`;
}
