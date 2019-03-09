import * as React from "react";
import * as ReactDOM from "react-dom";

const PortalContext = React.createContext<HTMLElement | null>(
  typeof document !== "undefined" ? document.body : null
);

export type unstable_PortalProps = {
  /** TODO: Description */
  children: React.ReactNode;
};

export function unstable_Portal({ children }: unstable_PortalProps) {
  // if it's a nested portal, context is the parent portal
  // otherwise it's document.body
  const context = React.useContext(PortalContext);
  const [container] = React.useState(() => {
    if (typeof document !== "undefined") {
      return document.createElement("div");
    }
    // ssr
    return null;
  });

  React.useLayoutEffect(() => {
    if (container && context) {
      context.appendChild(container);
      return () => {
        context.removeChild(container);
      };
    }
    return undefined;
  }, [container, context]);

  if (container) {
    const portal = ReactDOM.createPortal(children, container);
    return (
      <PortalContext.Provider value={container}>
        {portal}
      </PortalContext.Provider>
    );
  }

  // ssr
  return null;
}
