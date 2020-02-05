import * as React from "react";
import { removeItemFromArray } from "reakit-utils/removeItemFromArray";
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
    if (!context.addDialog || options.unstable_orphan) return undefined;
    context.addDialog(dialogRef);
    return () => {
      if (context.removeDialog) {
        context.removeDialog(dialogRef);
      }
    };
  }, [
    dialogRef,
    context.addDialog,
    context.removeDialog,
    options.unstable_orphan
  ]);

  // Close all nested dialogs when parent dialog closes
  React.useEffect(() => {
    if (
      context.visible === false &&
      options.visible &&
      options.hide &&
      !options.unstable_orphan
    ) {
      options.hide();
    }
  }, [context.visible, options.visible, options.hide, options.unstable_orphan]);

  // Provider
  const providerValue = React.useMemo(
    () => ({
      visible: options.visible,
      addDialog,
      removeDialog
    }),
    [options.visible, addDialog, removeDialog]
  );

  const wrap = React.useCallback(
    (element: React.ReactNode) => (
      <DialogContext.Provider value={providerValue}>
        {element}
      </DialogContext.Provider>
    ),
    [providerValue]
  );

  return { dialogs, wrap };
}
