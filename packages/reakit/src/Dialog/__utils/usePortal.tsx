import * as React from "react";
import { closest } from "reakit-utils/closest";
import { Portal, PortalContext } from "../../Portal/Portal";
import { DialogOptions } from "../Dialog";

export function usePortal(
  dialogRef: React.RefObject<HTMLElement>,
  options: DialogOptions
) {
  const context = React.useContext(PortalContext);

  const wrap = React.useCallback(
    (children: React.ReactNode) => {
      if (options.unstable_portal) {
        // Internally, Portal wraps children within a PortalContext.Provider
        // where the value is the portal itself, which means that nested
        // portals will be children of the parent portal and siblings of the
        // parent modal. This doesn't work out with VoiceOver, which seems to
        // require nested modals to be children of their parent modals.
        // So we overwrite the portal context for the children with the current
        // modal so nested modals will be children of it.
        children = (
          <Portal>
            <PortalContext.Provider value={dialogRef.current}>
              {children}
            </PortalContext.Provider>
          </Portal>
        );
      }

      if (options.unstable_orphan && context) {
        const value = closest(context, Portal.__selector) as HTMLElement;
        children = (
          <PortalContext.Provider value={value}>
            {children}
          </PortalContext.Provider>
        );
      }

      return children;
    },
    [dialogRef, context, options.unstable_portal, options.unstable_orphan]
  );

  return wrap;
}
