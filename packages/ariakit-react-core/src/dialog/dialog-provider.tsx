import type { ReactNode } from "react";
import { DialogContextProvider } from "./dialog-context.js";
import { useDialogStore } from "./dialog-store.js";
import type { DialogStoreProps } from "./dialog-store.js";

/**
 * Provides a dialog store to Dialog components.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * <DialogProvider>
 *   <Dialog />
 * </DialogProvider>
 * ```
 */
export function DialogProvider(props: DialogProviderProps = {}) {
  const store = useDialogStore(props);
  return (
    <DialogContextProvider value={store}>
      {props.children}
    </DialogContextProvider>
  );
}

export interface DialogProviderProps extends DialogStoreProps {
  children?: ReactNode;
}
