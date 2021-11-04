import { MouseEvent, useCallback, useContext, useMemo } from "react";
import { useEventCallback } from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { ButtonOptions, useButton } from "../button";
import { DialogContext } from "./__utils/dialog-context";
import { DialogState } from "./dialog-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a button that hides a dialog.
 * @see https://ariakit.org/docs/dialog
 * @example
 * ```jsx
 * const state = useDialogState();
 * const props = useDialogDismiss({ state });
 * <Dialog state={state}>
 *   <Role {...props} />
 * </Dialog>
 * ```
 */
export const useDialogDismiss = createHook<DialogDismissOptions>(
  ({ state, ...props }) => {
    const context = useContext(DialogContext);
    state = state || context;
    const onClickProp = useEventCallback(props.onClick);

    const onClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        state?.hide();
      },
      [onClickProp, state?.hide]
    );

    const children = useMemo(
      () => (
        <svg
          aria-label="Dismiss popup"
          display="block"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5pt"
          viewBox="0 0 16 16"
          height="1em"
          width="1em"
        >
          <line x1="4" y1="4" x2="12" y2="12" />
          <line x1="4" y1="12" x2="12" y2="4" />
        </svg>
      ),
      []
    );

    props = {
      "data-dialog-dismiss": "",
      children,
      ...props,
      onClick,
    };

    props = useButton(props);

    return props;
  }
);

/**
 * A component that renders a button that hides a dialog.
 * @see https://ariakit.org/docs/dialog
 * @example
 * ```jsx
 * const dialog = useDialogState();
 * <Dialog state={dialog}>
 *   <DialogDismiss />
 * </Dialog>
 * ```
 */
export const DialogDismiss = createComponent<DialogDismissOptions>((props) => {
  const htmlProps = useDialogDismiss(props);
  return createElement("button", htmlProps);
});

export type DialogDismissOptions<T extends As = "button"> = ButtonOptions<T> & {
  /**
   * Object returned by the `useDialogState` hook.
   */
  state?: DialogState;
};

export type DialogDismissProps<T extends As = "button"> = Props<
  DialogDismissOptions<T>
>;
