import { MouseEvent, useContext, useMemo } from "react";
import { useEvent } from "@ariakit/react-core/utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "@ariakit/react-core/utils/system";
import { As, Props } from "@ariakit/react-core/utils/types";
import { ButtonOptions, useButton } from "../button/button";
import { DialogContext } from "./dialog-context";
import { DialogStore } from "./dialog-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a button that hides a dialog.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const store = useDialogStore();
 * const props = useDialogDismiss({ store });
 * <Dialog store={store}>
 *   <Role {...props} />
 * </Dialog>
 * ```
 */
export const useDialogDismiss = createHook<DialogDismissOptions>(
  ({ store, ...props }) => {
    const context = useContext(DialogContext);
    store = store || context;

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      store?.hide();
    });

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
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const dialog = useDialogStore();
 * <Dialog store={dialog}>
 *   <DialogDismiss />
 * </Dialog>
 * ```
 */
export const DialogDismiss = createComponent<DialogDismissOptions>((props) => {
  const htmlProps = useDialogDismiss(props);
  return createElement("button", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  DialogDismiss.displayName = "DialogDismiss";
}

export type DialogDismissOptions<T extends As = "button"> = ButtonOptions<T> & {
  /**
   * Object returned by the `useDialogStore` hook.
   */
  store?: DialogStore;
};

export type DialogDismissProps<T extends As = "button"> = Props<
  DialogDismissOptions<T>
>;
