import * as React from "react";
import * as ReactDOM from "react-dom";

export type unstable_PortalProps = {
  /** TODO: Description */
  children: React.ReactNode;
};

export function unstable_Portal({ children }: unstable_PortalProps) {
  const [container] = React.useState(() => {
    if (typeof document !== "undefined") {
      return document.createElement("div");
    }
    // ssr
    return null;
  });

  React.useLayoutEffect(() => {
    if (container) {
      document.body.appendChild(container);
    }
    return () => {
      if (container) {
        document.body.removeChild(container);
      }
    };
  }, [container]);

  if (container) {
    return ReactDOM.createPortal(children, container);
  }

  // ssr
  return null;
}
