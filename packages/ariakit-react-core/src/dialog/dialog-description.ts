import { useContext } from "react";
import { useId, useSafeLayoutEffect } from "../utils/hooks.js";
import { createElement, createHook2 } from "../utils/system.js";
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
export const useDialogDescription =
  createHook2<TagNameDialogDescriptionOptions>(({ store, ...props }) => {
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
  });

/**
 * Renders a description in a dialog. This component must be wrapped with
 * [`Dialog`](https://ariakit.org/reference/dialog) so the `aria-describedby`
 * prop is properly set on the dialog element.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx {4}
 * const [open, setOpen] = useState(false);
 *
 * <Dialog open={open} onClose={() => setOpen(false)}>
 *   <DialogDescription>Description</DialogDescription>
 * </Dialog>
 * ```
 */
export const DialogDescription = forwardRef(function DialogDescription(
  props: DialogDescriptionProps,
) {
  const htmlProps = useDialogDescription(props);
  return createElement(TagName, htmlProps);
});

export interface DialogDescriptionOptions<T extends ElementType = TagName>
  extends Options<T> {
  /**
   * Object returned by the
   * [`useDialogStore`](https://ariakit.org/reference/use-dialog-store) hook. If
   * not provided, the closest [`Dialog`](https://ariakit.org/reference/dialog)
   * component's context will be used.
   */
  store?: DialogStore;
}

export type DialogDescriptionProps<T extends ElementType = TagName> = Props2<
  T,
  DialogDescriptionOptions<T>
>;
