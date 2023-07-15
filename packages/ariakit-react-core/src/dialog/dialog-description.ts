import { useContext } from "react";
import { useId, useSafeLayoutEffect } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";
import { DialogDescriptionContext } from "./dialog-context.js";
import type { DialogStore } from "./dialog-store.js";

/**
 * Returns props to create a `DialogDescription` component. This hook must be
 * used in a component that's wrapped with `Dialog` so the `aria-describedby`
 * prop is properly set on the dialog element.
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
  },
);

/**
 * Renders a description in a dialog. This component must be wrapped with
 * `Dialog` so the `aria-describedby` prop is properly set on the dialog
 * element.
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
  },
);

if (process.env.NODE_ENV !== "production") {
  DialogDescription.displayName = "DialogDescription";
}

export interface DialogDescriptionOptions<T extends As = "p">
  extends Options<T> {
  /**
   * Object returned by the `useDialogStore` hook. If not provided, the parent
   * `Dialog` component's context will be used.
   */
  store?: DialogStore;
}

export type DialogDescriptionProps<T extends As = "p"> = Props<
  DialogDescriptionOptions<T>
>;
