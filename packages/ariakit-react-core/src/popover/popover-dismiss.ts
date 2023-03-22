import {
  DialogDismissOptions,
  useDialogDismiss,
} from "../dialog/dialog-dismiss.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import { As, Props } from "../utils/types.js";
import { PopoverStore } from "./popover-store.js";

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
export const usePopoverDismiss = createHook<PopoverDismissOptions>((props) => {
  props = useDialogDismiss(props);
  return props;
});

/**
 * Renders a button that hides a popover.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const popover = usePopoverStore();
 * <Popover store={popover}>
 *   <PopoverDismiss />
 * </Popover>
 * ```
 */
export const PopoverDismiss = createComponent<PopoverDismissOptions>(
  (props) => {
    const htmlProps = usePopoverDismiss(props);
    return createElement("button", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  PopoverDismiss.displayName = "PopoverDismiss";
}

export interface PopoverDismissOptions<T extends As = "button">
  extends DialogDismissOptions<T> {
  /**
   * Object returned by the `usePopoverStore` hook. If not provided, the parent
   * `Popover` component's context will be used.
   */
  store?: PopoverStore;
}

export type PopoverDismissProps<T extends As = "button"> = Props<
  PopoverDismissOptions<T>
>;
