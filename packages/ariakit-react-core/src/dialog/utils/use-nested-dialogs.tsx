import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { chain } from "@ariakit/core/utils/misc";
import { useSafeLayoutEffect } from "../../utils/hooks.js";
import type { WrapElement } from "../../utils/types.js";
import type { DialogStore } from "../dialog-store.js";

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
      return chain(
        context.addDialog?.(dialog),
        (() => {
          setNestedDialogs((dialogs) => [...dialogs, dialog]);
          return () => {
            setNestedDialogs((dialogs) =>
              dialogs.filter((element) => element !== dialog)
            );
          };
        })()
      );
    },
    [context.addDialog]
  );

  const showModal = useCallback(
    (dialog: HTMLElement) => {
      return chain(
        context.showModal?.(dialog),
        (() => {
          setOpenModals((modals) => [...modals, dialog]);
          return () => {
            setOpenModals((modals) =>
              modals.filter((modal) => modal !== dialog)
            );
          };
        })()
      );
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
    return context.store?.syncBatch(
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
