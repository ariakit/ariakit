import * as React from "react";
import { reduceObjects } from "../__utils/reduceObjects";
import { UnionToIntersection } from "../__utils/types";
import { isObject } from "../__utils/isObject";

function extractPropFromObjects<T, K extends keyof T>(objects: T[], prop: K) {
  const props: Array<NonNullable<T[K]>> = [];

  for (const object of objects) {
    const p = object[prop];
    if (p) props.push(p!);
  }

  return props;
}

function mergeFunctionsInObjects(objects: Array<Record<string, any>>) {
  const object = reduceObjects(objects, value => typeof value === "function");
  const keys = Object.keys(object);
  const result: Record<string, any> = {};

  for (const key of keys) {
    const fns = object[key]!;
    result[key] =
      fns.length === 1
        ? fns[0]
        : fns.reduce((lastFn, currFn) => (...args: any[]) => {
            lastFn(...args);
            return currFn(...args);
          });
  }

  return result;
}

function mergeWrapInObjects(
  objects: Array<{
    unstable_wrap?: (children: React.ReactNode) => JSX.Element;
  }>
) {
  const wrappers = extractPropFromObjects(objects, "unstable_wrap");
  const { length } = wrappers;
  if (length === 0) return {};
  if (length === 1) return { unstable_wrap: wrappers[0] };
  return {
    unstable_wrap: wrappers.reduce((acc, curr) => (children: React.ReactNode) =>
      curr(acc(children))
    )
  };
}

function mergeRefsInObjects(objects: Array<{ ref?: React.Ref<any> }>) {
  const refs = extractPropFromObjects(objects, "ref");
  const { length } = refs;
  if (length === 0) return {};
  if (length === 1) return { ref: refs[0] };

  return {
    ref: (instance: any) => {
      for (const ref of refs) {
        if (typeof ref === "function") {
          ref(instance);
        } else if (ref) {
          (ref as React.MutableRefObject<any>).current = instance;
        }
      }
    }
  };
}

function mergeClassNamesInObjects(objects: Array<{ className?: string }>) {
  const classNames = extractPropFromObjects(objects, "className");
  if (classNames.length === 0) return {};
  return {
    className: classNames.join(" ")
  };
}

function mergeStylesInObjects(objects: Array<{ style?: any }>) {
  const styles = extractPropFromObjects(objects, "style");
  if (styles.length === 0) return {};
  if (styles.length === 1) return { style: styles[0] };
  return {
    style: Object.assign({}, ...styles)
  };
}

export function mergeProps<T extends any[]>(...objects: T) {
  objects = objects.filter(isObject) as T;
  return Object.assign(
    {},
    ...objects,
    mergeFunctionsInObjects(objects),
    mergeWrapInObjects(objects),
    mergeRefsInObjects(objects),
    mergeClassNamesInObjects(objects),
    mergeStylesInObjects(objects)
  ) as UnionToIntersection<T[number]>;
}
