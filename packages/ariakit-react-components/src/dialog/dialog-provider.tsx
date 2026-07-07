import type { ReactNode } from "react";
import {
  createDialogProvider,
  DialogContextProvider,
} from "./dialog-context.tsx";
import type { DialogStoreProps } from "./dialog-store.ts";
import { useDialogStore } from "./dialog-store.ts";

/**
 * Provides a dialog store to [Dialog](https://ariakit.com/components/dialog)
 * components.
 * @see https://ariakit.com/components/dialog
 * @example
 * ```jsx
 * <DialogProvider>
 *   <Dialog />
 * </DialogProvider>
 * ```
 */
export const DialogProvider = createDialogProvider(function DialogProvider(
  props: DialogProviderProps = {},
) {
  const store = useDialogStore(props);
  return (
    <DialogContextProvider value={store}>
      {props.children}
    </DialogContextProvider>
  );
});

export interface DialogProviderProps extends DialogStoreProps {
  children?: ReactNode;
}
