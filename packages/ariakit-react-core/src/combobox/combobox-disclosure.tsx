import type { ElementType, MouseEvent } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { DialogDisclosureOptions } from "../dialog/dialog-disclosure.js";
import { useDialogDisclosure } from "../dialog/dialog-disclosure.js";
import { useEvent } from "../utils/hooks.js";
import { createElement, createHook2, forwardRef } from "../utils/system.js";
import type { Props2 } from "../utils/types.js";
import { useComboboxProviderContext } from "./combobox-context.js";
import type { ComboboxStore } from "./combobox-store.js";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

const children = (
  <svg
    aria-hidden="true"
    display="block"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5pt"
    viewBox="0 0 16 16"
    height="1em"
    width="1em"
    pointerEvents="none"
  >
    <polyline points="4,6 8,10 12,6" />
  </svg>
);

/**
 * Returns props to create a `ComboboxDisclosure` component that toggles the
 * combobox popover visibility when clicked.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxDisclosure({ store });
 * <Combobox store={store} />
 * <Role {...props} />
 * <ComboboxPopover store={store}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxPopover>
 * ```
 */
export const useComboboxDisclosure = createHook2<
  TagName,
  ComboboxDisclosureOptions
>(function useComboboxDisclosure({ store, ...props }) {
  const context = useComboboxProviderContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "ComboboxDisclosure must receive a `store` prop or be wrapped in a ComboboxProvider component.",
  );

  const onMouseDownProp = props.onMouseDown;

  const onMouseDown = useEvent((event: MouseEvent<HTMLType>) => {
    onMouseDownProp?.(event);
    // We have to prevent the element from getting focused on mousedown.
    event.preventDefault();
    // This will immediately move focus to the combobox input.
    store?.move(null);
  });

  const onClickProp = props.onClick;

  const onClick = useEvent((event: MouseEvent<HTMLType>) => {
    onClickProp?.(event);
    if (event.defaultPrevented) return;
    if (!store) return;
    const { baseElement } = store.getState();
    store.setDisclosureElement(baseElement);
  });

  const open = store.useState("open");

  props = {
    children,
    tabIndex: -1,
    "aria-label": open ? "Hide popup" : "Show popup",
    "aria-expanded": open,
    ...props,
    onMouseDown,
    onClick,
  };

  // We're using DialogDisclosure, and not PopoverDisclosure, because
  // PopoverDisclosure will also update the `store.anchorRef` with the
  // disclosure element. We need to keep the combobox input as the anchorRef.
  props = useDialogDisclosure({ store, ...props });

  return props;
});

/**
 * Renders a combobox disclosure button that toggles the
 * [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover) element's
 * visibility when clicked.
 *
 * Although this button is not tabbable, it remains accessible to screen reader
 * users. On clicking, it automatically shifts focus to the
 * [`Combobox`](https://ariakit.org/reference/combobox) element.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {3}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxDisclosure />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxDisclosure = forwardRef(function ComboboxDisclosure(
  props: ComboboxDisclosureProps,
) {
  const htmlProps = useComboboxDisclosure(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxDisclosureOptions<T extends ElementType = TagName>
  extends DialogDisclosureOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxDisclosureProps<T extends ElementType = TagName> = Props2<
  T,
  ComboboxDisclosureOptions<T>
>;
