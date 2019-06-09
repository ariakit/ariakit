export function isObject(arg: any): arg is object {
  return typeof arg === "object" && arg != null;
}
