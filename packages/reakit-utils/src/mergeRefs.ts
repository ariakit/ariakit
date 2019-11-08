import * as React from "react";

export function mergeRefs(...refs: Array<React.Ref<any> | undefined>) {
  const filteredRefs = refs.filter(Boolean);
  if (!filteredRefs.length) return null;
  if (filteredRefs.length === 1) return filteredRefs[0];
  return (instance: any) => {
    for (const ref of filteredRefs) {
      if (typeof ref === "function") {
        ref(instance);
      } else if (ref) {
        (ref as React.MutableRefObject<any>).current = instance;
      }
    }
  };
}
