export function isPromise<T>(arg: T | Promise<T>): arg is Promise<T> {
  return Boolean(arg && (arg as Promise<T>).then);
}
