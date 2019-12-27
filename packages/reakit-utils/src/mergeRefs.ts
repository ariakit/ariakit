import * as React from "react";

/**
 * Merges multiple React ref props into a single value that can be passed to
 * a component.
 *
 * @example
 * import React from "react";
 * import { mergeRefs } from "reakit-utils";
 *
 * const Component = React.forwardRef((props, ref) => {
 *   const internalRef = React.useRef();
 *   return <div ref={mergeRefs(internalRef, ref)} {...props} />;
 * });
 */
export function mergeRefs(
  ...refs: Array<React.Ref<any> | undefined>
): React.Ref<any> | undefined {
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
