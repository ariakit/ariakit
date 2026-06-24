// Reads the array index off the known `name.` prefix without interpolating the
// user-controlled name into a RegExp, which could throw on regex metacharacters
// (e.g. `a(b`). Returns `NaN` when the field doesn't belong to the array.
export function getArrayFieldIndex(fieldName: string, name: string) {
  const prefix = `${name}.`;
  if (!fieldName.startsWith(prefix)) return Number.NaN;
  const index = fieldName.slice(prefix.length).match(/^\d+/)?.[0];
  return index ? Number.parseInt(index, 10) : Number.NaN;
}
