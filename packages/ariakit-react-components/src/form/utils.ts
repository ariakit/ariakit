/**
 * Checks whether `fieldName` belongs to the array field `name`, matching the
 * exact array boundary so sibling arrays whose names share this prefix (e.g.
 * `tags` and `tags2`) aren't matched.
 */
export function isArrayFieldName(fieldName: string, name: string) {
  return fieldName === name || fieldName.startsWith(`${name}.`);
}

/**
 * Reads the array index off the known `name.` prefix without interpolating the
 * user-controlled name into a RegExp, which could throw on regex metacharacters
 * (e.g. `a(b`). Returns `NaN` when the field doesn't belong to the array.
 */
export function getArrayFieldIndex(fieldName: string, name: string) {
  const prefix = `${name}.`;
  if (!fieldName.startsWith(prefix)) return Number.NaN;
  const index = fieldName.slice(prefix.length).match(/^\d+/)?.[0];
  return index ? Number.parseInt(index, 10) : Number.NaN;
}
