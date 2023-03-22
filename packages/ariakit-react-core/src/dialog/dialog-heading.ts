import { useContext } from "react";
import { HeadingOptions, useHeading } from "../heading/heading.js";
import { useId, useSafeLayoutEffect } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import { As, Props } from "../utils/types.js";
import { DialogHeadingContext } from "./dialog-context.js";
import { DialogStore } from "./dialog-store.js";

/**
 * Returns props to create a `DialogHeading` component. This hook must be used
 * in a component that's wrapped with `Dialog` so the `aria-labelledby` prop is
 * properly set on the dialog element.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * // This component must be wrapped with Dialog
 * const props = useDialogHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export const useDialogHeading = createHook<DialogHeadingOptions>(
  ({ store, ...props }) => {
    const setHeadingId = useContext(DialogHeadingContext);
    const id = useId(props.id);

    useSafeLayoutEffect(() => {
      setHeadingId?.(id);
      return () => setHeadingId?.(undefined);
    }, [setHeadingId, id]);

    props = {
      id,
      ...props,
    };

    props = useHeading(props);

    return props;
  }
);

/**
 * Renders a heading in a dialog. This component must be wrapped with `Dialog`
 * so the `aria-labelledby` prop is properly set on the dialog element.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const dialog = useDialogStore();
 * <Dialog store={dialog}>
 *   <DialogHeading>Heading</DialogHeading>
 * </Dialog>
 * ```
 */
export const DialogHeading = createComponent<DialogHeadingOptions>((props) => {
  const htmlProps = useDialogHeading(props);
  return createElement("h1", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  DialogHeading.displayName = "DialogHeading";
}

export interface DialogHeadingOptions<T extends As = "h1">
  extends HeadingOptions<T> {
  /**
   * Object returned by the `useDialogStore` hook. If not provided, the parent
   * `Dialog` component's context will be used.
   */
  store?: DialogStore;
}

export type DialogHeadingProps<T extends As = "h1"> = Props<
  DialogHeadingOptions<T>
>;
