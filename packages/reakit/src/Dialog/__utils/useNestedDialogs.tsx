import * as React from "react";
import { removeItemFromArray } from "reakit-utils/removeItemFromArray";
import { DialogOptions } from "../Dialog";

type DialogRef = React.RefObject<HTMLElement>;

const DialogContext = React.createContext<{
  visible?: boolean;
  addDialog?: (ref: DialogRef, visible?: boolean) => void;
  removeDialog?: (ref: DialogRef) => void;
}>({});

export function useNestedDialogs(dialogRef: DialogRef, options: DialogOptions) {
  const context = React.useContext(DialogContext);

  const [dialogs, setDialogs] = React.useState<Array<DialogRef>>([]);
  const [visibleModals, setVisibleModals] = React.useState(dialogs);

  const addDialog = React.useCallback(
    (ref: DialogRef, visible?: boolean) => {
      context.addDialog?.(ref);
      setDialogs(prevDialogs => [...prevDialogs, ref]);
      if (visible) {
        setVisibleModals(prevDialogs => [...prevDialogs, ref]);
      }
    },
    [context.addDialog]
  );

  const removeDialog = React.useCallback(
    (ref: DialogRef) => {
      context.removeDialog?.(ref);
      setDialogs(prevDialogs => removeItemFromArray(prevDialogs, ref));
      setVisibleModals(prevDialogs => removeItemFromArray(prevDialogs, ref));
    },
    [context.removeDialog]
  );

  // If it's a nested dialog, add it to context
  React.useEffect(() => {
    if (options.unstable_orphan) return undefined;
    context.addDialog?.(dialogRef, options.modal && options.visible);
    return () => {
      context.removeDialog?.(dialogRef);
    };
  }, [
    options.unstable_orphan,
    context.addDialog,
    dialogRef,
    options.modal,
    options.visible,
    context.removeDialog
  ]);

  // Close all nested dialogs when parent dialog closes
  React.useEffect(() => {
    if (
      context.visible === false &&
      options.visible &&
      !options.unstable_orphan
    ) {
      options.hide?.();
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

  return { dialogs, visibleModals, wrap };
}
