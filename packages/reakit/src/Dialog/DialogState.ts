import * as React from "react";
import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
import {
  useHiddenState,
  HiddenState,
  HiddenActions,
  HiddenInitialState
} from "../Hidden/HiddenState";

export type DialogState = HiddenState & {
  /**
   * Toggles Dialog's `modal` state.
   *   - Non-modal: `preventBodyScroll` doesn't work and focus is free.
   *   - Modal: `preventBodyScroll` is automatically enabled, focus is
   * trapped within the dialog and the dialog is rendered within a `Portal`
   * by default.
   */
  modal: boolean;
  /**
   * Whether or not the dialog should be rendered within `Portal`.
   * It's `true` by default if `modal` is `true`.
   */
  unstable_portal: boolean;
  /**
   * Whether or not the dialog should be a child of its parent.
   * Opening a nested orphan dialog will close its parent dialog if
   * `hideOnClickOutside` is set to `true` on the parent.
   * It will be set to `false` if `modal` is `false`.
   */
  unstable_orphan: boolean;
};

export type DialogActions = HiddenActions & {
  /**
   * Sets `modal`.
   */
  setModal: React.Dispatch<React.SetStateAction<DialogState["modal"]>>;
  /**
   * Sets `unstable_portal`.
   */
  unstable_setPortal: React.Dispatch<
    React.SetStateAction<DialogState["unstable_portal"]>
  >;
  /**
   * Sets `unstable_orphan`. It has no effect if `modal` is set to `false`, in
   * which case `unstable_orphan` will be always `false`.
   */
  unstable_setOrphan: React.Dispatch<
    React.SetStateAction<DialogState["unstable_orphan"]>
  >;
};

export type DialogInitialState = HiddenInitialState &
  Partial<Pick<DialogState, "modal" | "unstable_portal" | "unstable_orphan">>;

export type DialogStateReturn = DialogState &
  DialogActions & {
    /**
     * @private
     */
    unstable_stateValues: {
      modal: boolean;
      portal: boolean;
      orphan: boolean;
    };
  };

export function useDialogState(
  initialState: SealedInitialState<DialogInitialState> = {}
): DialogStateReturn {
  const {
    modal: initialModal = true,
    unstable_portal: initialPortal,
    unstable_orphan: initialOrphan,
    ...sealed
  } = useSealedState(initialState);

  const [modal, setModal] = React.useState(initialModal);
  const [portal, setPortal] = React.useState(() =>
    typeof initialPortal === "undefined" ? modal : false
  );
  const [orphan, setOrphan] = React.useState(() =>
    Boolean(modal && initialOrphan)
  );

  React.useEffect(() => {
    if (typeof initialPortal !== "undefined") return;

    if (modal !== portal) {
      setPortal(modal);
    }
  }, [initialPortal, modal, portal]);

  React.useEffect(() => {
    if (!modal && orphan) {
      setOrphan(false);
    }
  }, [modal, orphan]);

  const hidden = useHiddenState(sealed);

  return {
    modal,
    setModal,
    unstable_portal: portal,
    unstable_setPortal: setPortal,
    unstable_orphan: orphan,
    unstable_setOrphan: setOrphan,
    unstable_stateValues: { modal, portal, orphan },
    ...hidden
  };
}

const keys: Array<keyof DialogStateReturn> = [
  ...useHiddenState.__keys,
  "modal",
  "setModal",
  "unstable_portal",
  "unstable_setPortal",
  "unstable_orphan",
  "unstable_setOrphan",
  "unstable_stateValues"
];

useDialogState.__keys = keys;
