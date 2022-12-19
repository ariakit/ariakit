import { KeyboardEvent, MouseEvent, useCallback, useContext } from "react";
import { getPopupItemRole, isTextField } from "@ariakit/core/utils/dom";
import { isDownloading, isOpeningInNewTab } from "@ariakit/core/utils/events";
import { hasFocus } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import { BooleanOrCallback } from "@ariakit/core/utils/types";
import {
  CompositeHoverOptions,
  useCompositeHover,
} from "../composite/composite-hover";
import {
  CompositeItemOptions,
  useCompositeItem,
} from "../composite/composite-item";
import { useBooleanEvent, useEvent, useWrapElement } from "../utils/hooks";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system";
import { As, Props } from "../utils/types";
import { ComboboxContext, ComboboxItemValueContext } from "./combobox-context";
import { ComboboxStore } from "./combobox-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a combobox item.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxItem({ store, value: "value" });
 * <Role {...props} />
 * ```
 */
export const useComboboxItem = createHook<ComboboxItemOptions>(
  ({
    store,
    value,
    hideOnClick = value != null,
    setValueOnClick = true,
    shouldRegisterItem = true,
    focusOnHover = false,
    moveOnKeyPress = true,
    getItem: getItemProp,
    ...props
  }) => {
    const context = useContext(ComboboxContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxItem must be wrapped in a ComboboxList or ComboboxPopover component"
    );

    const getItem = useCallback<NonNullable<CompositeItemOptions["getItem"]>>(
      (item) => {
        const nextItem = { ...item, value };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [value, getItemProp]
    );

    const onClickProp = props.onClick;
    const setValueOnClickProp = useBooleanEvent(setValueOnClick);
    const hideOnClickProp = useBooleanEvent(hideOnClick);

    const onClick = useEvent((event: MouseEvent<HTMLDivElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (isDownloading(event)) return;
      if (isOpeningInNewTab(event)) return;
      if (value != null && setValueOnClickProp(event)) {
        store?.setValue(value);
      }
      if (hideOnClickProp(event)) {
        // When ComboboxList is used instead of ComboboxPopover, store.hide()
        // does nothing. The focus will not be moved over to the combobox
        // input automatically. So we need to move manually here.
        store?.move(null);
        store?.hide();
      }
    });

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      const baseElement = store?.getState().baseElement;
      if (!baseElement) return;
      if (hasFocus(baseElement)) return;
      // When the combobox is not working with virtual focus, the items will
      // receive DOM focus. Therefore, pressing printable keys will not fill
      // the text field. So we need to programmatically focus on the text
      // field when the user presses printable keys.
      const printable = event.key.length === 1;
      if (printable || event.key === "Backspace" || event.key === "Delete") {
        queueMicrotask(() => baseElement.focus());
        if (isTextField(baseElement)) {
          // If the combobox element is a text field, we should update the
          // store value with the current's element value. This is necessary
          // because the value may temporarily change based on the currently
          // selected item, but it'll be reset to the original value when the
          // combobox input is focused.
          store?.setValue(baseElement.value);
        }
      }
    });

    props = useWrapElement(
      props,
      (element) => (
        <ComboboxItemValueContext.Provider value={value}>
          {element}
        </ComboboxItemValueContext.Provider>
      ),
      [value]
    );

    const contentElement = store.useState("contentElement");

    props = {
      role: getPopupItemRole(contentElement),
      children: value,
      ...props,
      onClick,
      onKeyDown,
    };

    const moveOnKeyPressProp = useBooleanEvent(moveOnKeyPress);

    // We only register the item on the store when the popover is open so we
    // don't try to move focus to hidden items when pressing arrow keys.
    const shouldRegister = store.useState(
      (state) => state.mounted && shouldRegisterItem
    );

    props = useCompositeItem({
      store,
      ...props,
      getItem,
      shouldRegisterItem: shouldRegister,
      // Dispatch a custom event on the combobox input when moving to an item
      // with the keyboard so the Combobox component can enable inline
      // autocompletion.
      moveOnKeyPress: (event) => {
        if (!moveOnKeyPressProp(event)) return false;
        const moveEvent = new Event("combobox-item-move");
        const baseElement = store?.getState().baseElement;
        baseElement?.dispatchEvent(moveEvent);
        return true;
      },
    });

    props = useCompositeHover({ store, focusOnHover, ...props });

    return props;
  }
);

/**
 * A component that renders a combobox item inside a combobox list or popover.
 * The `role` prop will be automatically set based on the `ComboboxList` or
 * `ComboboxPopover` own `role` prop. For example, if the `ComboboxPopover`
 * component's `role` prop is set to `listbox` (default), the `ComboboxItem`
 * `role` will be set to `option`. By default, the `value` prop will be rendered
 * as the children, but this can be overriden.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxStore();
 * <Combobox store={combobox} />
 * <ComboboxPopover store={combobox}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxPopover>
 * ```
 */
export const ComboboxItem = createMemoComponent<ComboboxItemOptions>(
  (props) => {
    const htmlProps = useComboboxItem(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  ComboboxItem.displayName = "ComboboxItem";
}

export type ComboboxItemOptions<T extends As = "div"> = Omit<
  CompositeItemOptions<T>,
  "store"
> &
  Omit<CompositeHoverOptions<T>, "store" | "focusOnHover"> & {
    /**
     * Object returned by the `useComboboxStore` hook. If not provided, the
     * parent `ComboboxList` or `ComboboxPopover` components' context will be
     * used.
     */
    store?: ComboboxStore;
    /**
     * The value of the item. This will be rendered as the children by default.
     * If `setValueOnClick` is set to `true`, this will be the value of the
     * combobox input when the user clicks on this item. If
     * `combobox.autoComplete` is `both` or `inline`, this will be the value of
     * the combobox input when the combobox loses focus.
     */
    value?: string;
    /**
     * Whether to hide the combobox when this item is clicked.
     * @default true
     */
    hideOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
    /**
     * Whether to set the combobox value with this item's value when this item
     * is clicked.
     * @default true
     */
    setValueOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
    /**
     * Whether to focus the combobox item on hover.
     * @default false
     */
    focusOnHover?: CompositeHoverOptions["focusOnHover"];
  };

export type ComboboxItemProps<T extends As = "div"> = Props<
  ComboboxItemOptions<T>
>;
