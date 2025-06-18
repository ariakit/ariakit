export function objectId(object: string | { id: string }) {
  return typeof object === "string" ? object : object.id;
}

export function keys<T extends Record<string, unknown>>(object: T) {
  return Object.keys(object) as [keyof T, ...(keyof T)[]];
}
