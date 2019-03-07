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
  const wrapper = React.useContext(PortalContext);
  const [container] = React.useState(() => {
    if (typeof document !== "undefined") {
      return document.createElement("div");
    }
    // ssr
    return null;
  });

  React.useLayoutEffect(() => {
    if (container && wrapper) {
      wrapper.appendChild(container);
    }
    return () => {
      if (container && wrapper) {
        wrapper.removeChild(container);
      }
    };
  }, [container, wrapper]);

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
