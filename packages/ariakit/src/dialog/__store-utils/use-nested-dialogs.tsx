import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  store.useEffect(
    (state) => {
      if (!state.contentElement) return;
      return context.addDialog?.(state.contentElement);
    },
    ["contentElement", context.addDialog]
  );

  store.useEffect(
    (state) => {
      if (!modal) return;
      if (!state.open) return;
      if (!state.contentElement) return;
      return context.showModal?.(state.contentElement);
    },
    ["open", "contentElement", modal, context.showModal]
  );

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
