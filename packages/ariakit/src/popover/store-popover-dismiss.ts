import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  DialogDismissOptions,
  useDialogDismiss,
} from "../dialog/store-dialog-dismiss";
import { PopoverStore } from "./store-popover-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a button that hides a popover.
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
 * A component that renders a button that hides a popover.
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

export type PopoverDismissOptions<T extends As = "button"> = Omit<
  DialogDismissOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `usePopoverStore` hook. If not provided, the parent
   * `Popover` component's context will be used.
   */
  store?: PopoverStore;
};

export type PopoverDismissProps<T extends As = "button"> = Props<
  PopoverDismissOptions<T>
>;
