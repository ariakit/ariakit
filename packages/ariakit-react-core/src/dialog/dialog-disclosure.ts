import { DisclosureOptions, useDisclosure } from "../disclosure/disclosure.js";
import {
  createComponent,
  createElement,
  createHook,
} from "../utils/system.jsx";
import { As, Props } from "../utils/types.js";
import { DialogStore } from "./dialog-store.js";

/**
 * Returns props to create a `DialogDisclosure` component.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const store = useDialogStore();
 * const props = useDialogDisclosure({ store });
 * <Role {...props}>Disclosure</Role>
 * <Dialog store={store}>Content</Dialog>
 * ```
 */
export const useDialogDisclosure = createHook<DialogDisclosureOptions>(
  ({ store, ...props }) => {
    props = useDisclosure({ store, ...props });
    return props;
  }
);

/**
 * Renders a button that shows/hides a dialog.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const dialog = useDialogStore();
 * <DialogDisclosure store={dialog}>Disclosure</DialogDisclosure>
 * <Dialog store={dialog}>Content</Dialog>
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

export interface DialogDisclosureOptions<T extends As = "button">
  extends DisclosureOptions<T> {
  /**
   * Object returned by the `useDialogStore` hook.
   */
  store: DialogStore;
}

export type DialogDisclosureProps<T extends As = "button"> = Props<
  DialogDisclosureOptions<T>
>;
