export function objectId(object: string | { id: string }) {
  return typeof object === "string" ? object : object.id;
}
