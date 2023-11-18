import { matches } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import { createDialogComponent } from "../dialog/dialog.js";
import type { PopoverOptions } from "../popover/popover.js";
import { usePopover } from "../popover/popover.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useComboboxProviderContext } from "./combobox-context.js";
import type { ComboboxListOptions } from "./combobox-list.js";
import { useComboboxList } from "./combobox-list.js";

function isController(
  target: EventTarget | Element | null,
  ...ids: Array<string | undefined>
) {
  if (!target) return false;
  if ("id" in target) {
    const selector = ids
      .filter(Boolean)
      .map((id) => `[aria-controls="${id}"]`)
      .join(", ");
    if (!selector) return false;
    return matches(target, selector);
  }
  return false;
}

/**
 * Returns props to create a `ComboboxPopover` component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxPopover({ store });
 * <Role {...props}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </Role>
 * ```
 */
export const useComboboxPopover = createHook<ComboboxPopoverOptions>(
  ({
    store,
    tabIndex,
    alwaysVisible,
    hideOnInteractOutside = true,
    ...props
  }) => {
    const context = useComboboxProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxPopover must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const baseElement = store.useState("baseElement");

    props = useComboboxList({ store, alwaysVisible, ...props });

    props = usePopover({
      store,
      alwaysVisible,
      autoFocusOnShow: false,
      autoFocusOnHide: false,
      finalFocus: baseElement,
      preserveTabOrderAnchor: null,
      ...props,
      // Combobox popovers can't be modal because the focus may be (and is by
      // default) outside of it on the combobox input element.
      modal: false,
      // Make sure we don't hide the popover when the user interacts with the
      // combobox cancel or the combobox disclosure buttons. They will have the
      // aria-controls attribute pointing to either the combobox input or the
      // combobox popover elements.
      hideOnInteractOutside: (event: Event) => {
        const state = store?.getState();
        const contentId = state?.contentElement?.id;
        const baseId = state?.baseElement?.id;
        if (isController(event.target, contentId, baseId)) return false;
        const result =
          typeof hideOnInteractOutside === "function"
            ? hideOnInteractOutside(event)
            : hideOnInteractOutside;
        return result;
      },
    });

    return props;
  },
);

/**
 * Renders a combobox popover. The `role` prop is set to `listbox` by default,
 * but can be overriden by any other valid combobox popup role (`listbox`,
 * `menu`, `tree`, `grid` or `dialog`). The `aria-labelledby` prop is set to the
 * combobox input element's `id` by default.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxPopover = createDialogComponent(
  createComponent<ComboboxPopoverOptions>((props) => {
    const htmlProps = useComboboxPopover(props);
    return createElement("div", htmlProps);
  }),
  useComboboxProviderContext,
);

if (process.env.NODE_ENV !== "production") {
  ComboboxPopover.displayName = "ComboboxPopover";
}

export interface ComboboxPopoverOptions<T extends As = "div">
  extends ComboboxListOptions<T>,
    Omit<PopoverOptions<T>, "store" | "modal"> {}

export type ComboboxPopoverProps<T extends As = "div"> = Props<
  ComboboxPopoverOptions<T>
>;
