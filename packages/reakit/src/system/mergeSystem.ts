import { isObject } from "../__utils/isObject";
import { reduceObjects } from "../__utils/reduceObjects";
import { UnionToIntersection } from "../__utils/types";
import { unstable_SystemContextType } from "./SystemContext";
import { mergeFunctionsInObjects } from "../__utils/mergeFunctionsInObjects";

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

export function mergeSystem<T extends unstable_SystemContextType[]>(
  ...systems: T
) {
  return Object.assign(
    {},
    ...systems,
    mergeObjectsInObjects(systems),
    mergeFunctionsInObjects(systems)
  ) as UnionToIntersection<T[number]>;
}
