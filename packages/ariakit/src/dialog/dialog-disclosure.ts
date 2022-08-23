import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { DisclosureOptions, useDisclosure } from "../disclosure/disclosure";
import { DialogState } from "./dialog-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a button that shows/hides a dialog.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const state = useDialogState();
 * const props = useDialogDisclosure({ state });
 * <Role {...props}>Disclosure</Role>
 * <Dialog state={state}>Content</Dialog>
 * ```
 */
export const useDialogDisclosure = createHook<DialogDisclosureOptions>(
  ({ state, ...props }) => {
    props = useDisclosure({ state, ...props });
    return props;
  }
);

/**
 * A component that renders a button that shows/hides a dialog.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const dialog = useDialogState();
 * <DialogDisclosure state={dialog}>Disclosure</DialogDisclosure>
 * <Dialog state={dialog}>Content</Dialog>
 * ```
 */
export const DialogDisclosure = createComponent<DialogDisclosureOptions>(
  (props) => {
    const htmlProps = useDialogDisclosure(props);
    return createElement("button", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  DialogDisclosure.displayName = "DialogDisclosure";
}

export type DialogDisclosureOptions<T extends As = "button"> = Omit<
  DisclosureOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useDialogState` hook.
   */
  state: DialogState;
};

export type DialogDisclosureProps<T extends As = "button"> = Props<
  DialogDisclosureOptions<T>
>;
