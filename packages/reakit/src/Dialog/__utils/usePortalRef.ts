import * as React from "react";
import { Portal } from "../../Portal/Portal";

export function usePortalRef(
  dialogRef: React.RefObject<HTMLElement>,
  shouldAssign?: boolean
) {
  const portalRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !shouldAssign) return;
    portalRef.current = dialog.closest(Portal.__selector) as HTMLElement;
  }, [dialogRef, shouldAssign]);

  return portalRef;
}
