import { UnionToIntersection, PickByValue } from "../__utils/types";
import { unstable_SystemContextType } from "./SystemContext";

function reduceObjects<T extends Record<string, any>>(
  objects: T[],
  filter?: (key: keyof T, value: T[keyof T]) => boolean
) {
  const result = {} as { [K in keyof T]?: Array<T[K]> };

  for (const object of objects) {
    const keys = Object.keys(object);
    for (const key of keys) {
      // eslint-disable-next-line no-continue
      if (filter && !filter(key, object[key])) continue;
      result[key] = [...(result[key] || []), object[key]];
    }
  }

  return result;
}

function mergeObjects<T extends unstable_SystemContextType[]>(...systems: T) {
  const object = reduceObjects(
    systems,
    (_, value) => typeof value === "object" && value != null
  );

  const keys = Object.keys(object);
  const result = {} as PickByValue<
    UnionToIntersection<T[number]>,
    Record<string, any>
  >;

  for (const key of keys) {
    const values = object[key]!;
    // @ts-ignore
    result[key] = Object.assign({}, ...values);
  }

  return result;
}

function mergeFunctions<T extends unstable_SystemContextType[]>(...systems: T) {
  const object = reduceObjects(
    systems,
    (_, value) => typeof value === "function"
  );

  const keys = Object.keys(object);
  const result = {} as PickByValue<
    UnionToIntersection<T[number]>,
    (...args: any[]) => any
  >;

  for (const key of keys) {
    const fns = object[key]!;
    // @ts-ignore
    result[key] =
      fns.length === 1
        ? fns[0]
        : fns.reduce((lastHook, currHook) => (...args: any[]) =>
            currHook(...args.slice(0, -1), lastHook(...args))
          );
  }

  return result;
}

export function mergeSystem<T extends unstable_SystemContextType[]>(
  ...systems: T
) {
  return Object.assign(
    {},
    ...systems,
    mergeObjects(...systems),
    mergeFunctions(...systems)
  ) as UnionToIntersection<T[number]>;
}
