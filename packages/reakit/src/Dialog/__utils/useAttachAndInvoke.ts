import * as React from "react";

const attr = "data-invoke";

export function useAttachAndInvoke(
  targetRef: React.RefObject<Element>,
  containerRef: React.RefObject<Element>,
  name: string,
  method?: () => void,
  shouldInvoke?: boolean
) {
  // Attach
  React.useEffect(() => {
    const element = targetRef.current;

    if (!element || !method) return;

    Object.defineProperty(targetRef.current, name, {
      writable: true,
      value: method
    });

    const attribute = element.getAttribute(attr);
    const invokeValues = attribute ? attribute.split(" ") : [];
    if (invokeValues.indexOf(name) === -1) {
      element.setAttribute("data-invoke", [...invokeValues, name].join(" "));
    }
  }, [targetRef, name, method]);

  // Invoke
  React.useEffect(() => {
    const container = containerRef.current;

    if (!container || !method || !shouldInvoke) return;

    const elements = container.querySelectorAll(`[${attr}~="${name}"]`);

    elements.forEach((element: any) => element[name]());
  }, [containerRef, name, method, shouldInvoke]);
}
