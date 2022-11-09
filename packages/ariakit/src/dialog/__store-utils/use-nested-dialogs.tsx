import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSafeLayoutEffect } from "ariakit-react-utils/hooks";
import { WrapElement } from "ariakit-react-utils/types";
import { chain } from "ariakit-utils/misc";
import { DialogStore } from "../store-dialog-store";

const NestedDialogsContext = createContext<{
  store?: DialogStore;
  addDialog?: (dialog: HTMLElement) => () => void;
  showModal?: (dialog: HTMLElement) => () => void;
}>({});

/**
 * Handles nested dialogs.
 */
export function useNestedDialogs(store: DialogStore, modal?: boolean) {
  const context = useContext(NestedDialogsContext);
  const [openModals, setOpenModals] = useState<HTMLElement[]>([]);
  const [nestedDialogs, setNestedDialogs] = useState<HTMLElement[]>([]);
  const open = store.useState("open");
  const contentElement = store.useState("contentElement");

  const addDialog = useCallback(
    (dialog: HTMLElement) => {
      return chain(context.addDialog?.(dialog), () => {
        setNestedDialogs((dialogs) => [...dialogs, dialog]);
        return () => {
          setNestedDialogs((dialogs) =>
            dialogs.filter((element) => element !== dialog)
          );
        };
      });
    },
    [context.addDialog]
  );

  const showModal = useCallback(
    (dialog: HTMLElement) => {
      return chain(context.showModal?.(dialog), () => {
        setOpenModals((modals) => [...modals, dialog]);
        return () => {
          setOpenModals((modals) => modals.filter((modal) => modal !== dialog));
        };
      });
    },
    [context.showModal]
  );

  // If this is a nested dialog, add it to the context.
  useSafeLayoutEffect(() => {
    if (!contentElement) return;
    return context.addDialog?.(contentElement);
  }, [contentElement, context.addDialog]);

  useSafeLayoutEffect(() => {
    if (!modal) return;
    if (!open) return;
    if (!contentElement) return;
    return context.showModal?.(contentElement);
  }, [modal, open, contentElement, context.showModal]);

  // Close all nested dialogs when parent dialog closes.
  useEffect(() => {
    return context.store?.effect(
      (state) => {
        if (!state.open) {
          store.setOpen(false);
        }
      },
      ["open"]
    );
  }, [context.store, store]);

  // Provider
  const providerValue = useMemo(
    () => ({ store, addDialog, showModal }),
    [store, addDialog, showModal]
  );

  const wrapElement: WrapElement = useCallback(
    (element) => (
      <NestedDialogsContext.Provider value={providerValue}>
        {element}
      </NestedDialogsContext.Provider>
    ),
    [providerValue]
  );

  return { nestedDialogs, openModals, wrapElement };
}
