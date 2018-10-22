import * as React from "react";

function applyAllRefs<T = any>(...refs: Array<React.Ref<T> | undefined>) {
  return (element: T) => {
    for (const value of refs) {
      if (typeof value === "object" && value !== null) {
        // @ts-ignore
        value.current = element;
      } else if (typeof value === "function") {
        value(element);
      }
    }
  };
}

export default applyAllRefs;
