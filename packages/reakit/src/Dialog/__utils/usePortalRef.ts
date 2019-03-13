import * as React from "react";
import { Portal } from "../../Portal/Portal";

export function usePortalRef(dialogRef: React.RefObject<HTMLElement>) {
  const portalRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    portalRef.current = dialog.closest(Portal.__selector) as HTMLElement;
  }, [dialogRef]);

  return portalRef;
}
