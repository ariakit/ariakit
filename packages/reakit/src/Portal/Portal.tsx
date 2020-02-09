import * as React from "react";
import * as ReactDOM from "react-dom";
import { useIsomorphicEffect } from "reakit-utils/useIsomorphicEffect";

export type PortalProps = {
  /**
   * Portal's children.
   */
  children: React.ReactNode;
};

function getBodyElement() {
  return typeof document !== "undefined" ? document.body : null;
}

export const PortalContext = React.createContext<HTMLElement | null>(
  getBodyElement()
);

export function Portal({ children }: PortalProps) {
  // if it's a nested portal, context is the parent portal
  // otherwise it's document.body
  // https://github.com/reakit/reakit/issues/513
  const context = React.useContext(PortalContext) || getBodyElement();
  const [portal] = React.useState(() => {
    if (typeof document !== "undefined") {
      const element = document.createElement("div");
      element.className = Portal.__className;
      return element;
    }
    // ssr
    return null;
  });

  useIsomorphicEffect(() => {
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
