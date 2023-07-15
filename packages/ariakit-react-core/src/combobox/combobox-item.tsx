import type { KeyboardEvent, MouseEvent } from "react";
import { useCallback, useContext } from "react";
import { getPopupItemRole, isTextField } from "@ariakit/core/utils/dom";
import { isDownloading, isOpeningInNewTab } from "@ariakit/core/utils/events";
import { hasFocus } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { CompositeHoverOptions } from "../composite/composite-hover.js";
import { useCompositeHover } from "../composite/composite-hover.js";
import type { CompositeItemOptions } from "../composite/composite-item.js";
import { useCompositeItem } from "../composite/composite-item.js";
import { useBooleanEvent, useEvent, useWrapElement } from "../utils/hooks.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import {
  ComboboxContext,
  ComboboxItemValueContext,
} from "./combobox-context.js";
import type { ComboboxStore } from "./combobox-store.js";

/**
 * Returns props to create a `ComboboxItem` component.
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
        "ComboboxItem must be wrapped in a ComboboxList or ComboboxPopover component",
    );

    const getItem = useCallback<NonNullable<CompositeItemOptions["getItem"]>>(
      (item) => {
        const nextItem = { ...item, value };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [value, getItemProp],
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
      [value],
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

    props = useCompositeItem({
      store,
      ...props,
      getItem,
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
  },
);

/**
 * Renders a combobox item inside a combobox list or popover. The `role` prop
 * will be automatically set based on the `ComboboxList` or `ComboboxPopover`
 * own `role` prop. For example, if the `ComboboxPopover` component's `role`
 * prop is set to `listbox` (default), the `ComboboxItem` `role` will be set to
 * `option`. By default, the `value` prop will be rendered as the children, but
 * this can be overriden.
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
  },
);

if (process.env.NODE_ENV !== "production") {
  ComboboxItem.displayName = "ComboboxItem";
}

export interface ComboboxItemOptions<T extends As = "div">
  extends CompositeItemOptions<T>,
    CompositeHoverOptions<T> {
  /**
   * Object returned by the `useComboboxStore` hook. If not provided, the parent
   * `ComboboxList` or `ComboboxPopover` components' context will be used.
   */
  store?: ComboboxStore;
  /**
   * The value of the item. This will be rendered as the children by default.
   *   - If `setValueOnClick` is set to `true`, this will be the value of the
   *     combobox input when the user clicks on this item.
   *   - If the `autoComplete` prop on the `Combobox` component is set to `both`
   *     or `inline`, this will be the value of the combobox input when the
   *     combobox loses focus.
   */
  value?: string;
  /**
   * Whether to hide the combobox when this item is clicked.
   * @default true
   */
  hideOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * Whether to set the combobox value with this item's value when this item is
   * clicked.
   * @default true
   */
  setValueOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * @default false
   */
  focusOnHover?: CompositeHoverOptions["focusOnHover"];
}

export type ComboboxItemProps<T extends As = "div"> = Props<
  ComboboxItemOptions<T>
>;
