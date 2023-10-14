import { getPopupRole } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import type { DisclosureOptions } from "../disclosure/disclosure.js";
import { useDisclosure } from "../disclosure/disclosure.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useDialogProviderContext } from "./dialog-context.js";
import type { DialogStore } from "./dialog-store.js";

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
    const context = useDialogProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "DialogDisclosure must receive a `store` prop or be wrapped in a DialogProvider component.",
    );

    const contentElement = store.useState("contentElement");

    props = {
      "aria-haspopup": getPopupRole(contentElement, "dialog"),
      ...props,
    };

    props = useDisclosure({ store, ...props });

    return props;
  },
);

/**
 * Renders a button that shows/hides a dialog.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx {2}
 * <DialogProvider>
 *   <DialogDisclosure>Disclosure</DialogDisclosure>
 *   <Dialog>Content</Dialog>
 * </DialogProvider>
 * ```
 */
export const DialogDisclosure = createComponent<DialogDisclosureOptions>(
  (props) => {
    const htmlProps = useDialogDisclosure(props);
    return createElement("button", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  DialogDisclosure.displayName = "DialogDisclosure";
}

export interface DialogDisclosureOptions<T extends As = "button">
  extends DisclosureOptions<T> {
  /**
   * Object returned by the
   * [`useDialogStore`](https://ariakit.org/reference/use-dialog-store) hook. If
   * not provided, the closest
   * [`DialogProvider`](https://ariakit.org/reference/dialog-provider)
   * component's context will be used.
   */
  store?: DialogStore;
}

export type DialogDisclosureProps<T extends As = "button"> = Props<
  DialogDisclosureOptions<T>
>;
