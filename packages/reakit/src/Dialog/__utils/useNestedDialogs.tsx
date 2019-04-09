import * as React from "react";
import { removeItemFromArray } from "../../__utils/removeItemFromArray";
import { DialogOptions } from "../Dialog";

const DialogContext = React.createContext<{
  visible?: boolean;
  addDialog?: (ref: React.RefObject<HTMLElement>) => void;
  removeDialog?: (ref: React.RefObject<HTMLElement>) => void;
}>({});

export function useNestedDialogs(
  dialogRef: React.RefObject<HTMLElement>,
  options: DialogOptions
) {
  const context = React.useContext(DialogContext);

  const [dialogs, setDialogs] = React.useState<
    Array<React.RefObject<HTMLElement>>
  >([]);

  const addDialog = React.useCallback(
    (ref: React.RefObject<HTMLElement>) => {
      if (context.addDialog) {
        context.addDialog(ref);
      }
      setDialogs(refs => [...refs, ref]);
    },
    [context.addDialog]
  );

  const removeDialog = React.useCallback(
    (ref: React.RefObject<HTMLElement>) => {
      if (context.removeDialog) {
        context.removeDialog(ref);
      }
      setDialogs(refs => removeItemFromArray(refs, ref));
    },
    [context.removeDialog]
  );

  // If it's a nested dialog, add it to context
  React.useEffect(() => {
    if (!context.addDialog) return undefined;
    context.addDialog(dialogRef);
    return () => {
      if (context.removeDialog) {
        context.removeDialog(dialogRef);
      }
    };
  }, [dialogRef, context.addDialog, context.removeDialog]);

  // Close all nested dialogs when parent dialog closes
  React.useEffect(() => {
    if (context.visible === false && options.visible && options.hide) {
      options.hide();
    }
  }, [context.visible, options.visible, options.hide]);

  // Provider
  const providerValue = React.useMemo(
    () => ({
      visible: options.visible,
      addDialog,
      removeDialog
    }),
    [options.visible, addDialog, removeDialog]
  );

  const wrapChildren = (children: React.ReactNode) => (
    <DialogContext.Provider value={providerValue}>
      {children}
    </DialogContext.Provider>
  );

  return { dialogs, wrapChildren };
}
