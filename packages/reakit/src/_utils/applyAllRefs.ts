import * as React from "react";

function applyAllRefs<T = any>(...refs: Array<React.Ref<T> | undefined>) {
  const validRefs = refs.filter(Boolean);
  if (!validRefs.length) return undefined;
  return (element: T) => {
    for (const value of validRefs) {
      if (typeof value === "object") {
        // @ts-ignore
        value.current = element;
      } else if (typeof value === "function") {
        value(element);
      }
    }
  };
}

export default applyAllRefs;
