export function toArray(arg: any) {
  if (Array.isArray(arg)) {
    return arg;
  }
  return [arg];
}
