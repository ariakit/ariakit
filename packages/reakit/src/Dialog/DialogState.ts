import * as React from "react";
import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
import {
  useDisclosureState,
  DisclosureState,
  DisclosureActions,
  DisclosureInitialState,
  DisclosureStateReturn
} from "../Disclosure/DisclosureState";

export type DialogState = DisclosureState & {
  /**
   * Toggles Dialog's `modal` state.
   *   - Non-modal: `preventBodyScroll` doesn't work and focus is free.
   *   - Modal: `preventBodyScroll` is automatically enabled, focus is
   * trapped within the dialog and the dialog is rendered within a `Portal`
   * by default.
   */
  modal: boolean;
};

export type DialogActions = DisclosureActions & {
  /**
   * Sets `modal`.
   */
  setModal: React.Dispatch<React.SetStateAction<DialogState["modal"]>>;
};

export type DialogInitialState = DisclosureInitialState &
  Partial<Pick<DialogState, "modal">>;

export type DialogStateReturn = DisclosureStateReturn &
  DialogState &
  DialogActions & {
    /**
     * @private
     */
    unstable_modal: boolean;
  };

export function useDialogState(
  initialState: SealedInitialState<DialogInitialState> = {}
): DialogStateReturn {
  const { modal: initialModal = true, ...sealed } = useSealedState(
    initialState
  );

  const [modal, setModal] = React.useState(initialModal);
  const hidden = useDisclosureState(sealed);

  return {
    modal,
    setModal,
    unstable_modal: modal,
    ...hidden
  };
}

const keys: Array<keyof DialogStateReturn> = [
  ...useDisclosureState.__keys,
  "modal",
  "setModal",
  "unstable_modal"
];

useDialogState.__keys = keys;
