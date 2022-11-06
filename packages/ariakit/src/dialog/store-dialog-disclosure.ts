import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  DisclosureOptions,
  useDisclosure,
} from "../disclosure/store-disclosure";
import { DialogStore } from "./store-dialog-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a button that shows/hides a dialog.
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
 * A component that renders a button that shows/hides a dialog.
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

export type DialogDisclosureOptions<T extends As = "button"> = Omit<
  DisclosureOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useDialogStore` hook.
   */
  store: DialogStore;
};

export type DialogDisclosureProps<T extends As = "button"> = Props<
  DialogDisclosureOptions<T>
>;
