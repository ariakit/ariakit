import { getActiveElement } from "ariakit-utils/dom";
import { addGlobalEventListener } from "ariakit-utils/events";
import { useSafeLayoutEffect } from "ariakit-utils/hooks";
import { useStorePublisher } from "ariakit-utils/store";
import {
  DisclosureState,
  DisclosureStateProps,
  useDisclosureState,
} from "../disclosure/disclosure-state";

/**
 * Provides state for the `Dialog` components.
 * @example
 * ```jsx
 * const dialog = useDialogState();
 * <DialogDisclosure state={dialog}>Disclosure</DialogDisclosure>
 * <Dialog state={dialog}>Content</Dialog>
 * ```
 */
export function useDialogState(props: DialogStateProps = {}): DialogState {
  const disclosure = useDisclosureState(props);

  // Sets the disclosure ref.
  useSafeLayoutEffect(() => {
    if (disclosure.mounted) return;
    // We get the last focused element before the dialog opens, so we can move
    // the focus back to it when the dialog closes.
    return addGlobalEventListener("focusin", () => {
      const activeElement = getActiveElement() as HTMLElement | null;
      if (activeElement) {
        disclosure.disclosureRef.current = activeElement;
      }
    });
  }, [disclosure.mounted, disclosure.disclosureRef]);

  return useStorePublisher(disclosure);
}

export type DialogState = DisclosureState;

export type DialogStateProps = DisclosureStateProps;
