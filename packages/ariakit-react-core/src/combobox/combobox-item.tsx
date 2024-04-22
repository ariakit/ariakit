import type { ElementType, KeyboardEvent, MouseEvent } from "react";
import { useCallback, useContext } from "react";
import { isTextField } from "@ariakit/core/utils/dom";
import { isDownloading, isOpeningInNewTab } from "@ariakit/core/utils/events";
import { hasFocus } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { CompositeHoverOptions } from "../composite/composite-hover.tsx";
import { useCompositeHover } from "../composite/composite-hover.tsx";
import type { CompositeItemOptions } from "../composite/composite-item.tsx";
import { useCompositeItem } from "../composite/composite-item.tsx";
import { useBooleanEvent, useEvent, useWrapElement } from "../utils/hooks.ts";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import {
  ComboboxItemCheckedContext,
  ComboboxItemValueContext,
  ComboboxListRoleContext,
  useComboboxScopedContext,
} from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function isSelected(storeValue?: string | string[], itemValue?: string) {
  if (itemValue == null) return;
  if (storeValue == null) return false;
  if (Array.isArray(storeValue)) {
    return storeValue.includes(itemValue);
  }
  return storeValue === itemValue;
}

function getItemRole(popupRole?: string) {
  const itemRoleByPopupRole = {
    menu: "menuitem",
    listbox: "option",
    tree: "treeitem",
  };
  const key = popupRole as keyof typeof itemRoleByPopupRole;
  return itemRoleByPopupRole[key] ?? "option";
}

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
export const useComboboxItem = createHook<TagName, ComboboxItemOptions>(
  function useComboboxItem({
    store,
    value,
    hideOnClick,
    setValueOnClick,
    selectValueOnClick = true,
    resetValueOnSelect,
    focusOnHover = false,
    moveOnKeyPress = true,
    getItem: getItemProp,
    ...props
  }) {
    const context = useComboboxScopedContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxItem must be wrapped in a ComboboxList or ComboboxPopover component.",
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

    const multiSelectable = store.useState((state) =>
      Array.isArray(state.selectedValue),
    );

    const selected = store.useState((state) =>
      isSelected(state.selectedValue, value),
    );

    const resetValueOnSelectState = store.useState("resetValueOnSelect");

    setValueOnClick = setValueOnClick ?? !multiSelectable;
    hideOnClick = hideOnClick ?? (value != null && !multiSelectable);

    const onClickProp = props.onClick;
    const setValueOnClickProp = useBooleanEvent(setValueOnClick);
    const selectValueOnClickProp = useBooleanEvent(selectValueOnClick);
    const resetValueOnSelectProp = useBooleanEvent(
      resetValueOnSelect ?? resetValueOnSelectState ?? multiSelectable,
    );
    const hideOnClickProp = useBooleanEvent(hideOnClick);

    const onClick = useEvent((event: MouseEvent<HTMLType>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (isDownloading(event)) return;
      if (isOpeningInNewTab(event)) return;
      if (value != null) {
        if (selectValueOnClickProp(event)) {
          if (resetValueOnSelectProp(event)) {
            store?.resetValue();
          }
          store?.setSelectedValue((prevValue) => {
            if (!Array.isArray(prevValue)) return value;
            if (prevValue.includes(value)) {
              return prevValue.filter((v) => v !== value);
            }
            return [...prevValue, value];
          });
        }
        if (setValueOnClickProp(event)) {
          store?.setValue(value);
        }
      }
      if (hideOnClickProp(event)) {
        store?.hide();
      }
    });

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
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

    if (multiSelectable && selected != null) {
      props = {
        "aria-selected": selected,
        ...props,
      };
    }

    props = useWrapElement(
      props,
      (element) => (
        <ComboboxItemValueContext.Provider value={value}>
          <ComboboxItemCheckedContext.Provider value={selected ?? false}>
            {element}
          </ComboboxItemCheckedContext.Provider>
        </ComboboxItemValueContext.Provider>
      ),
      [value, selected],
    );

    const popupRole = useContext(ComboboxListRoleContext);

    props = {
      role: getItemRole(popupRole),
      children: value,
      ...props,
      onClick,
      onKeyDown,
    };

    const moveOnKeyPressProp = useBooleanEvent(moveOnKeyPress);

    props = useCompositeItem<TagName>({
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
 * Renders a combobox item inside
 * [`ComboboxList`](https://ariakit.org/reference/combobox-list) or
 * [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
 * components.
 *
 * By default, the [`value`](https://ariakit.org/reference/combobox-item#value)
 * prop will be rendered as the children, but this can be overriden.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {4-6}
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
export const ComboboxItem = memo(
  forwardRef(function ComboboxItem(props: ComboboxItemProps) {
    const htmlProps = useComboboxItem(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface ComboboxItemOptions<T extends ElementType = TagName>
  extends CompositeItemOptions<T>,
    CompositeHoverOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxList`](https://ariakit.org/reference/combobox-list) or
   * [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
   * components' context will be used.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
   */
  store?: ComboboxStore;
  /**
   * The value of the item. This will be rendered as the children by default.
   * - If
   *   [`setValueOnClick`](https://ariakit.org/reference/combobox-item#setvalueonclick)
   *   is set to `true`, this will be the value of the combobox input when the
   *   user clicks on this item.
   * - If
   *   [`selectValueOnClick`](https://ariakit.org/reference/combobox-item#selectvalueonclick)
   *   is set to `true`, this will be the value of the
   *   [`selectedValue`](https://ariakit.org/reference/combobox-provider#selectedvalue)
   *   state.
   * - If the
   *   [`autoComplete`](https://ariakit.org/reference/combobox#autocomplete)
   *   prop on the [`Combobox`](https://ariakit.org/reference/combobox)
   *   component is set to `both` or `inline`, this will be the value of the
   *   combobox input when the combobox loses focus.
   *
   * Live examples:
   * - [Animated Combobox](https://ariakit.org/examples/combobox-animated)
   * - [ComboboxCancel](https://ariakit.org/examples/combobox-cancel)
   * - [ComboboxDisclosure](https://ariakit.org/examples/combobox-disclosure)
   * - [Combobox filtering](https://ariakit.org/examples/combobox-filtering)
   * - [ComboboxGroup](https://ariakit.org/examples/combobox-group)
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   */
  value?: string;
  /**
   * Whether to hide the combobox when this item is clicked. By default, the
   * combobox will be hidden when the user clicks on an item with a
   * [`value`](https://ariakit.org/reference/combobox-item#value) prop, unless
   * the combobox is
   * [multi-selectable](https://ariakit.org/examples/combobox-multiple).
   *
   * Live examples:
   * - [Combobox with links](https://ariakit.org/examples/combobox-links)
   * - [Submenu with
   *   Combobox](https://ariakit.org/examples/menu-nested-combobox)
   * - [Command Menu](https://ariakit.org/examples/dialog-combobox-command-menu)
   */
  hideOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * Whether to set the combobox
   * [`value`](https://ariakit.org/reference/combobox-provider#value) state
   * using this item's
   * [`value`](https://ariakit.org/reference/combobox-item#value) when the item
   * is clicked. The default is `true`, unless the combobox is
   * [multi-selectable](https://ariakit.org/examples/combobox-multiple).
   *
   * Live examples:
   * - [Menu with Combobox](https://ariakit.org/examples/menu-combobox)
   * - [Submenu with
   *   Combobox](https://ariakit.org/examples/menu-nested-combobox)
   */
  setValueOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * Whether to set the
   * [`selectedValue`](https://ariakit.org/reference/combobox-provider#selectedvalue)
   * state using this item's
   * [`value`](https://ariakit.org/reference/combobox-item#value) when the item
   * is clicked. If a callback is provided, it will only be invoked if the item
   * has a value.
   *
   * Live examples:
   * - [Submenu with
   *   Combobox](https://ariakit.org/examples/menu-nested-combobox)
   * @default true
   */
  selectValueOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * Whether to reset the the combobox input value when this item is selected or
   * unselected by click. This prop is set to `true` by default if
   * the combobox supports multiple selections. In other words, if the
   * [`selectedValue`](https://ariakit.org/reference/combobox-provider#selectedvalue)
   * or
   * [`defaultSelectedValue`](https://ariakit.org/reference/combobox-provider#defaultselectedvalue)
   * props are arrays.
   */
  resetValueOnSelect?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * @default false
   */
  focusOnHover?: CompositeHoverOptions["focusOnHover"];
}

export type ComboboxItemProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxItemOptions<T>
>;
