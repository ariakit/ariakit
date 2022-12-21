import { MouseEvent } from "react";
import {
  DialogDisclosureOptions,
  useDialogDisclosure,
} from "../dialog/dialog-disclosure";
import { useEvent } from "../utils/hooks";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { ComboboxStore } from "./combobox-store";

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
export const useComboboxDisclosure = createHook<ComboboxDisclosureOptions>(
  ({ store, ...props }) => {
    const onMouseDownProp = props.onMouseDown;

    const onMouseDown = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onMouseDownProp?.(event);
      // We have to prevent the element from getting focused on mousedown.
      event.preventDefault();
      // This will immediately move focus to the combobox input.
      store.move(null);
    });

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      const { baseElement } = store.getState();
      store.setDisclosureElement(baseElement);
    });

    const label = store.useState((state) =>
      state.open ? "Hide popup" : "Show popup"
    );

    props = {
      children,
      tabIndex: -1,
      "aria-label": label,
      ...props,
      onMouseDown,
      onClick,
    };

    // We're using DialogDisclosure, and not PopoverDisclosure, because
    // PopoverDisclosure will also update the `store.anchorRef` with the
    // disclosure element. We need to keep the combobox input as the anchorRef.
    props = useDialogDisclosure({ store, ...props });

    return props;
  }
);

/**
 * Renders a combobox disclosure button that toggles the combobox popover
 * visibility when clicked.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxStore();
 * <Combobox store={combobox} />
 * <ComboboxDisclosure store={combobox} />
 * <ComboboxPopover store={combobox}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxPopover>
 * ```
 */
export const ComboboxDisclosure = createComponent<ComboboxDisclosureOptions>(
  (props) => {
    const htmlProps = useComboboxDisclosure(props);
    return createElement("button", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  ComboboxDisclosure.displayName = "ComboboxDisclosure";
}

export interface ComboboxDisclosureOptions<T extends As = "button">
  extends DialogDisclosureOptions<T> {
  /**
   * Object returned by the `useComboboxStore` hook.
   */
  store: ComboboxStore;
}

export type ComboboxDisclosureProps<T extends As = "button"> = Props<
  ComboboxDisclosureOptions<T>
>;
