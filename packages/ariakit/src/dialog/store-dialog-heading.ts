import { useContext } from "react";
import { useId, useSafeLayoutEffect } from "ariakit-react-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import { HeadingOptions, useHeading } from "../heading";
import { DialogHeadingContext } from "./__store-utils/dialog-context";
import { DialogStore } from "./store-dialog-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a heading element for a dialog. This hook must be
 * used in a component that's wrapped with `Dialog` so the `aria-labelledby`
 * prop is properly set on the dialog element.
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
 * A component that renders a heading in a dialog. This component must be
 * wrapped with `Dialog` so the `aria-labelledby` prop is properly set on the
 * dialog element.
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

export type DialogHeadingOptions<T extends As = "h1"> = HeadingOptions<T> & {
  /**
   * Object returned by the `useDialogStore` hook. If not provided, the parent
   * `Dialog` component's context will be used.
   */
  store?: DialogStore;
};

export type DialogHeadingProps<T extends As = "h1"> = Props<
  DialogHeadingOptions<T>
>;
