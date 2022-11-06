import { useContext } from "react";
import { useId, useSafeLayoutEffect } from "ariakit-react-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Options, Props } from "ariakit-react-utils/types";
import { DialogDescriptionContext } from "./__store-utils/dialog-context";
import { DialogStore } from "./store-dialog-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a description element for a dialog. This hook
 * must be used in a component that's wrapped with `Dialog` so the
 * `aria-describedby` prop is properly set on the dialog element.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * // This component must be wrapped with Dialog
 * const props = useDialogDescription();
 * <Role {...props}>Description</Role>
 * ```
 */
export const useDialogDescription = createHook<DialogDescriptionOptions>(
  ({ store, ...props }) => {
    const setDescriptionId = useContext(DialogDescriptionContext);
    const id = useId(props.id);

    useSafeLayoutEffect(() => {
      setDescriptionId?.(id);
      return () => setDescriptionId?.(undefined);
    }, [setDescriptionId, id]);

    props = {
      id,
      ...props,
    };

    return props;
  }
);

/**
 * A component that renders a description in a dialog. This component must be
 * wrapped with `Dialog` so the `aria-describedby` prop is properly set on the
 * dialog element.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const dialog = useDialogStore();
 * <Dialog store={dialog}>
 *   <DialogDescription>Description</DialogDescription>
 * </Dialog>
 * ```
 */
export const DialogDescription = createComponent<DialogDescriptionOptions>(
  (props) => {
    const htmlProps = useDialogDescription(props);
    return createElement("p", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  DialogDescription.displayName = "DialogDescription";
}

export type DialogDescriptionOptions<T extends As = "p"> = Options<T> & {
  /**
   * Object returned by the `useDialogStore` hook. If not provided, the parent
   * `Dialog` component's context will be used.
   */
  store?: DialogStore;
};

export type DialogDescriptionProps<T extends As = "p"> = Props<
  DialogDescriptionOptions<T>
>;
