import * as React from "react";
import { Portal } from "../../Portal/Portal";
import { DialogOptions } from "../Dialog";

export function usePortalRef(
  dialogRef: React.RefObject<HTMLElement>,
  options: DialogOptions
) {
  const portalRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !options.visible) return;
    portalRef.current = dialog.closest(Portal.__selector) as HTMLElement;
  }, [dialogRef, options.visible]);

  return portalRef;
}
