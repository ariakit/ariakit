import { reduceObjects } from "./reduceObjects";

/**
 * Converts [{ fn: fn1 }, { fn: fn2 }] into { fn: fn2(fn1()) }
 */
export function mergeFunctionsInObjects(objects: Array<Record<string, any>>) {
  const object = reduceObjects(objects, value => typeof value === "function");
  const keys = Object.keys(object);
  const result: Record<string, any> = {};

  for (const key of keys) {
    const fns = object[key]!;
    result[key] =
      fns.length === 1
        ? fns[0]
        : fns.reduce((lastHook, currHook) => (...args: any[]) =>
            currHook(...args.slice(0, -1), lastHook(...args))
          );
  }

  return result;
}
