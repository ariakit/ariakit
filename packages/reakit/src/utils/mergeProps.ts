import * as React from "react";
import { UnionToIntersection } from "../__utils/types";
import { extractPropFromObjects } from "../__utils/extractPropFromObjects";
import { mergeFunctionsInObjects } from "../__utils/mergeFunctionsInObjects";

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
  return Object.assign(
    {},
    ...objects,
    mergeRefsInObjects(objects),
    mergeClassNamesInObjects(objects),
    mergeFunctionsInObjects(objects),
    mergeStylesInObjects(objects)
  ) as UnionToIntersection<T[number]>;
}
