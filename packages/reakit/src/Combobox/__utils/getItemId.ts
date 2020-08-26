export function getItemId(baseId: string, value: string, id?: string) {
  // TODO: kebabCase on value
  return id || `${baseId}-${value}`;
}
