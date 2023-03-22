import {
  DialogDescriptionOptions,
  useDialogDescription,
} from "../dialog/dialog-description.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import { As, Props } from "../utils/types.js";
import { PopoverStore } from "./popover-store.js";

/**
 * Returns props to create a `PopoverDescription` component. This hook must be
 * used in a component that's wrapped with `Popover` so the `aria-describedby`
 * prop is properly set on the popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * // This component must be wrapped with Popover
 * const props = usePopoverDescription();
 * <Role {...props}>Description</Role>
 * ```
 */
export const usePopoverDescription = createHook<PopoverDescriptionOptions>(
  (props) => {
    props = useDialogDescription(props);
    return props;
  }
);

/**
 * Renders a description in a popover. This component must be wrapped with
 * `Popover` so the `aria-describedby` prop is properly set on the popover
 * element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const popover = usePopoverStore();
 * <Popover store={popover}>
 *   <PopoverDescription>Description</PopoverDescription>
 * </Popover>
 * ```
 */
export const PopoverDescription = createComponent<PopoverDescriptionOptions>(
  (props) => {
    const htmlProps = usePopoverDescription(props);
    return createElement("p", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  PopoverDescription.displayName = "PopoverDescription";
}

export interface PopoverDescriptionOptions<T extends As = "p">
  extends DialogDescriptionOptions<T> {
  /**
   * Object returned by the `usePopoverStore` hook. If not provided, the parent
   * `Popover` component's context will be used.
   */
  store?: PopoverStore;
}

export type PopoverDescriptionProps<T extends As = "p"> = Props<
  PopoverDescriptionOptions<T>
>;
