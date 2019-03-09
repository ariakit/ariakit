import * as React from "react";

export const PortalContext = React.createContext<HTMLElement | null>(
  typeof document !== "undefined" ? document.body : null
);

export function usePortalContext() {
  return React.useContext(PortalContext);
}
