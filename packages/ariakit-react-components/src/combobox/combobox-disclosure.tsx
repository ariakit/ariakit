import { useStoreState } from "@ariakit/react-store";
import {
  useEvent,
  useMergeRefs,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { invariant } from "@ariakit/utils";
import type { ElementType, MouseEvent } from "react";
import { withDefaultButtonType } from "../button/utils.ts";
import type { DialogDisclosureOptions } from "../dialog/dialog-disclosure.tsx";
import { useDialogDisclosure } from "../dialog/dialog-disclosure.tsx";
import { useComboboxElement } from "./__combobox-element.ts";
import { useComboboxProviderContext } from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

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
    strokeWidth={1.5}
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
 * @see https://ariakit.com/components/combobox
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
export const useComboboxDisclosure = createHook<
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

  const setDisclosureElement = useComboboxElement(store, "disclosure");

  const onMouseDownProp = props.onMouseDown;

  const onMouseDown = useEvent((event: MouseEvent<HTMLType>) => {
    onMouseDownProp?.(event);
    if (event.defaultPrevented) return;
    // We have to prevent the element from getting focused on mousedown.
    event.preventDefault();
    // This will immediately move focus to the combobox input.
    store?.move(null);
  });

  const open = useStoreState(store, "open");

  props = {
    children,
    tabIndex: -1,
    "aria-label": open ? "Hide popup" : "Show popup",
    "aria-expanded": open,
    ...props,
    ref: useMergeRefs(setDisclosureElement, props.ref),
    onMouseDown,
  };

  props = useDialogDisclosure({ store, ...props });

  return props;
});

/**
 * Renders a combobox disclosure button that toggles the
 * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) element's
 * visibility when clicked.
 *
 * Although this button is not tabbable, it remains accessible to screen reader
 * users. On clicking, it automatically shifts focus to the
 * [`Combobox`](https://ariakit.com/reference/combobox) element.
 * @see https://ariakit.com/components/combobox
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
  const htmlProps = useComboboxDisclosure(withDefaultButtonType(props));
  return createElement(TagName, htmlProps);
});

export interface ComboboxDisclosureOptions<
  T extends ElementType = TagName,
> extends DialogDisclosureOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxDisclosureProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxDisclosureOptions<T>
>;
