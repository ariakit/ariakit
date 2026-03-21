import type { ElementType } from "react";
import type { DialogDismissOptions } from "../dialog/dialog-dismiss.tsx";
import { useDialogDismiss } from "../dialog/dialog-dismiss.tsx";
import type { StoreProp } from "../utils/system.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { usePopoverScopedContextStore } from "./popover-context.tsx";
import type { PopoverStore } from "./popover-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `PopoverDismiss` component.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const store = usePopoverStore();
 * const props = usePopoverDismiss({ store });
 * <Popover store={store}>
 *   <Role {...props} />
 * </Popover>
 * ```
 */
export const usePopoverDismiss = createHook<TagName, PopoverDismissOptions>(
  function usePopoverDismiss({ store, ...props }) {
    store = usePopoverScopedContextStore(store, "PopoverDismiss");
    props = useDialogDismiss({ store, ...props });
    return props;
  },
);

/**
 * Renders a button that hides a
 * [`Popover`](https://ariakit.org/reference/popover) component when clicked.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx {3}
 * <PopoverProvider>
 *   <Popover>
 *     <PopoverDismiss />
 *   </Popover>
 * </PopoverProvider>
 * ```
 */
export const PopoverDismiss = forwardRef(function PopoverDismiss(
  props: PopoverDismissProps,
) {
  const htmlProps = usePopoverDismiss(props);
  return createElement(TagName, htmlProps);
});

export interface PopoverDismissOptions<
  T extends ElementType = TagName,
> extends DialogDismissOptions<T> {
  /**
   * Object returned by the
   * [`usePopoverStore`](https://ariakit.org/reference/use-popover-store)
   * hook.
   * This prop can also receive the corresponding
   * [`PopoverProvider`](https://ariakit.org/reference/popover-provider)
   * component, which makes the component read the store from that provider's
   * context explicitly, or `null`, which disables context lookup.
   * If not provided, the closest
   * [`PopoverProvider`](https://ariakit.org/reference/popover-provider)
   * component's context will be used.
   */
  store?: StoreProp<PopoverStore>;
}

export type PopoverDismissProps<T extends ElementType = TagName> = Props<
  T,
  PopoverDismissOptions<T>
>;
