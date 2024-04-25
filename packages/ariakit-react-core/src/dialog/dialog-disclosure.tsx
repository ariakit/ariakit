import { getPopupRole } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import type { ElementType } from "react";
import type { DisclosureOptions } from "../disclosure/disclosure.tsx";
import { useDisclosure } from "../disclosure/disclosure.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useDialogProviderContext } from "./dialog-context.tsx";
import type { DialogStore } from "./dialog-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;

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
export const useDialogDisclosure = createHook<TagName, DialogDisclosureOptions>(
  function useDialogDisclosure({ store, ...props }) {
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
 * Renders a button that toggles the visibility of a
 * [`Dialog`](https://ariakit.org/reference/dialog) component when clicked.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx {2}
 * <DialogProvider>
 *   <DialogDisclosure>Disclosure</DialogDisclosure>
 *   <Dialog>Content</Dialog>
 * </DialogProvider>
 * ```
 */
export const DialogDisclosure = forwardRef(function DialogDisclosure(
  props: DialogDisclosureProps,
) {
  const htmlProps = useDialogDisclosure(props);
  return createElement(TagName, htmlProps);
});

export interface DialogDisclosureOptions<T extends ElementType = TagName>
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

export type DialogDisclosureProps<T extends ElementType = TagName> = Props<
  T,
  DialogDisclosureOptions<T>
>;
