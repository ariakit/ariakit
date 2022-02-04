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
  return disclosure;
}

export type DialogState = DisclosureState;

export type DialogStateProps = DisclosureStateProps;
