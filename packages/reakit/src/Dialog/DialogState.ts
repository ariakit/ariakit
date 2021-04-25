import * as React from "react";
import { InitialState } from "reakit-utils/types";
import { useInitialValue } from "reakit-utils/hooks";
import {
  useDisclosureState,
  DisclosureState,
  DisclosureActions,
  DisclosureInitialState,
  DisclosureStateReturn,
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
  /**
   * @private
   */
  unstable_disclosureRef: React.MutableRefObject<HTMLElement | null>;
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
  DialogActions;

export function useDialogState(
  initialState: InitialState<DialogInitialState> = {}
): DialogStateReturn {
  const { modal: initialModal = true, ...sealed } = useInitialValue(
    initialState
  );

  const disclosure = useDisclosureState(sealed);
  const [modal, setModal] = React.useState(initialModal);
  const disclosureRef = React.useRef<HTMLElement | null>(null);

  return {
    ...disclosure,
    modal,
    setModal,
    unstable_disclosureRef: disclosureRef,
  };
}
