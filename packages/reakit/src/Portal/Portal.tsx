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
  const [portal] = React.useState(() => {
    if (typeof document !== "undefined") {
      const element = document.createElement("div");
      element.className = Portal.__className;
      return element;
    }
    // ssr
    return null;
  });

  React.useEffect(() => {
    if (!portal || !context) return undefined;
    context.appendChild(portal);
    return () => {
      context.removeChild(portal);
    };
  }, [portal, context]);

  if (portal) {
    return ReactDOM.createPortal(
      <PortalContext.Provider value={portal}>
        {children}
      </PortalContext.Provider>,
      portal
    );
  }

  // ssr
  return null;
}

Portal.__className = "__reakit-portal";
Portal.__selector = `.${Portal.__className}`;
