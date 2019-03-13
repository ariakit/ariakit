import * as React from "react";

const attr = "data-invoke";

export function useAttachAndInvoke(
  targetRef: React.RefObject<Element>,
  containerRef: React.RefObject<Element>,
  method?: () => void,
  shouldInvoke?: boolean
) {
  // Attach
  React.useEffect(() => {
    const element = targetRef.current;

    if (!element || !method) return;

    Object.defineProperty(targetRef.current, method.name, {
      writable: true,
      value: method
    });

    const invokeValues = (element.getAttribute(attr) || "").split(" ");
    if (invokeValues.indexOf(method.name) === -1) {
      element.setAttribute(
        "data-invoke",
        [...invokeValues, method.name].join(" ")
      );
    }
  }, [targetRef, method]);

  // Invoke
  React.useEffect(() => {
    const container = containerRef.current;

    if (!container || !method || !shouldInvoke) return;

    const elements = container.querySelectorAll(`[${attr}~="${method.name}"]`);

    elements.forEach((element: any) => element[method.name]());
  }, [containerRef, method, shouldInvoke]);
}
