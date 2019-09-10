import * as React from "react";
import * as ReactDOM from "react-dom";

export type PortalProps = {
  /**
   * Portal's children.
   */
  children: React.ReactNode;
};

export const PortalContext = React.createContext<HTMLElement | null>(
  typeof document !== "undefined" ? document.body : null
);

export function Portal({ children }: PortalProps) {
  // if it's a nested portal, context is the parent portal
  // otherwise it's document.body
  const context = React.useContext(PortalContext);
  const [container] = React.useState(() => {
    if (typeof document !== "undefined") {
      const portal = document.createElement("div");
      portal.className = Portal.__className;
      return portal;
    }
    // ssr
    return null;
  });

  React.useEffect(() => {
    if (!container || !context) return undefined;
    context.appendChild(container);
    return () => {
      context.removeChild(container);
    };
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

Portal.__className = "__reakit-portal";
Portal.__selector = `.${Portal.__className}`;
