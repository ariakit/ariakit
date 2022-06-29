import {
  RefObject,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useSafeLayoutEffect } from "ariakit-utils/hooks";
import { WrapElement } from "ariakit-utils/types";
import { DialogOptions } from "../dialog";

type DialogRef = RefObject<HTMLElement>;

const NestedDialogsContext = createContext<{
  open?: boolean;
  addDialog?: (ref: RefObject<HTMLElement>) => () => void;
  showModal?: (ref: RefObject<HTMLElement>) => () => void;
}>({});

/**
 * Handles nested dialogs.
 */
export function useNestedDialogs(
  dialogRef: DialogRef,
  { state, modal }: Pick<DialogOptions, "state" | "modal">
) {
  const context = useContext(NestedDialogsContext);
  const [nestedDialogs, setNestedDialogs] = useState<DialogRef[]>([]);
  const [visibleModals, setVisibleModals] = useState<DialogRef[]>([]);

  const addDialog = useCallback(
    (ref: DialogRef) => {
      const removeFromContext = context.addDialog?.(ref);
      setNestedDialogs((dialogs) => [...dialogs, ref]);
      return () => {
        removeFromContext?.();
        setNestedDialogs((dialogs) =>
          dialogs.filter((dialog) => dialog !== ref)
        );
      };
    },
    [context.addDialog]
  );

  const showModal = useCallback(
    (ref: DialogRef) => {
      const hideModal = context.showModal?.(ref);
      setVisibleModals((modals) => [...modals, ref]);
      return () => {
        hideModal?.();
        setVisibleModals((modals) => modals.filter((modal) => modal !== ref));
      };
    },
    [context.showModal]
  );

  // If this is a nested dialog, add it to the context.
  useSafeLayoutEffect(() => {
    return context.addDialog?.(dialogRef);
  }, [context.addDialog, dialogRef]);

  useSafeLayoutEffect(() => {
    if (!modal) return;
    if (!state.open) return;
    return context.showModal?.(dialogRef);
  }, [modal, state.open, context.showModal, dialogRef]);

  // Close all nested dialogs when parent dialog closes.
  useSafeLayoutEffect(() => {
    if (context.open === false && state.open) {
      state.hide();
    }
  }, [context.open, state.open, state.hide]);

  // Provider
  const providerValue = useMemo(
    () => ({ open: state.open, addDialog, showModal }),
    [state.open, addDialog, showModal]
  );

  const wrapElement: WrapElement = useCallback(
    (element) => (
      <NestedDialogsContext.Provider value={providerValue}>
        {element}
      </NestedDialogsContext.Provider>
    ),
    [providerValue]
  );

  return { nestedDialogs, visibleModals, wrapElement };
}
