import { isObject } from "reakit-utils/isObject";
import { UnionToIntersection } from "reakit-utils/types";
import { reduceObjects } from "./__utils/reduceObjects";
import { SystemContextType } from "./SystemContext";

function mergeFunctionsInObjects(objects: Array<Record<string, any>>) {
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

function mergeObjectsInObjects(systems: Array<Record<string, any>>) {
  const object = reduceObjects(systems, isObject);
  const keys = Object.keys(object);
  const result: Record<string, any> = {};

  for (const key of keys) {
    const values = object[key]!;
    result[key] = Object.assign({}, ...values);
  }

  return result;
}

export function mergeSystem<T extends SystemContextType[]>(...systems: T) {
  return Object.assign(
    {},
    ...systems,
    mergeObjectsInObjects(systems),
    mergeFunctionsInObjects(systems)
  ) as UnionToIntersection<T[number]>;
}
