import { useContext } from "react";
import type { ElementType } from "react";
import type { HeadingOptions } from "../heading/heading.tsx";
import { useHeading } from "../heading/heading.tsx";
import { useId, useSafeLayoutEffect } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { DialogHeadingContext } from "./dialog-context.tsx";
import type { DialogStore } from "./dialog-store.ts";

const TagName = "h1" satisfies ElementType;
type TagName = typeof TagName;

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
export const useDialogHeading = createHook<TagName, DialogHeadingOptions>(
  function useDialogHeading({ store, ...props }) {
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
  },
);

/**
 * Renders a heading in a dialog. This component must be wrapped with
 * [`Dialog`](https://ariakit.org/reference/dialog) so the `aria-labelledby`
 * prop is properly set on the dialog element.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx {4}
 * const [open, setOpen] = useState(false);
 *
 * <Dialog open={open} onClose={() => setOpen(false)}>
 *   <DialogHeading>Heading</DialogHeading>
 * </Dialog>
 * ```
 */
export const DialogHeading = forwardRef(function DialogHeading(
  props: DialogHeadingProps,
) {
  const htmlProps = useDialogHeading(props);
  return createElement(TagName, htmlProps);
});

export interface DialogHeadingOptions<T extends ElementType = TagName>
  extends HeadingOptions<T> {
  /**
   * Object returned by the
   * [`useDialogStore`](https://ariakit.org/reference/use-dialog-store) hook. If
   * not provided, the closest [`Dialog`](https://ariakit.org/reference/dialog)
   * component's context will be used.
   */
  store?: DialogStore;
}

export type DialogHeadingProps<T extends ElementType = TagName> = Props<
  T,
  DialogHeadingOptions<T>
>;
