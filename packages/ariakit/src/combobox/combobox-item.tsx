import { KeyboardEvent, MouseEvent, useCallback } from "react";
import { createHook, createElement } from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { getPopupRole, isTextField } from "ariakit-utils/dom";
import { useEventCallback, useWrapElement } from "ariakit-utils/hooks";
import { queueMicrotask } from "ariakit-utils/misc";
import { BooleanOrCallback } from "ariakit-utils/types";
import {
  CompositeHoverOptions,
  useCompositeHover,
} from "../composite/composite-hover";
import {
  CompositeItemOptions,
  useCompositeItem,
} from "../composite/composite-item";
import { ComboboxState } from "./combobox-state";
import { ComboboxContext, ComboboxItemValueContext } from "./__utils";

const itemRoleByPopupRole = {
  listbox: "option",
  tree: "treeitem",
  grid: "gridcell",
};

function getItemRole(contentElement?: HTMLElement | null) {
  const popupRole = getPopupRole(contentElement);
  if (!popupRole) return;
  return itemRoleByPopupRole[popupRole as keyof typeof itemRoleByPopupRole];
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a combobox item.
 * @see https://ariakit.org/docs/combobox
 * @example
 * ```jsx
 * const state = useComboboxState();
 * const props = useComboboxItem({ state, value: "value" });
 * <Role {...props} />
 * ```
 */
export const useComboboxItem = createHook<ComboboxItemOptions>(
  ({
    state,
    value,
    hideOnClick = true,
    setValueOnClick = true,
    shouldRegisterItem = true,
    focusOnMouseMove = false,
    ...props
  }) => {
    state = useStore(state || ComboboxContext, [
      "setValue",
      "move",
      "hide",
      "virtualFocus",
      "baseRef",
      "contentElement",
      "mounted",
    ]);

    const getItem = useCallback(
      (item) => {
        const nextItem = { ...item, value };
        if (props.getItem) {
          return props.getItem(nextItem);
        }
        return nextItem;
      },
      [value, props.getItem]
    );

    const onClickProp = useEventCallback(props.onClick);

    const onClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        if (value == null) return;
        if (setValueOnClick) {
          state?.setValue(value);
        }
        if (hideOnClick) {
          // When ComboboxList is used instead of ComboboxPopover, state.hide()
          // does nothing. The focus will not be moved over to the combobox
          // input automatically. So we need to move manually here.
          state?.move(null);
          state?.hide();
        }
      },
      [
        onClickProp,
        value,
        setValueOnClick,
        state?.setValue,
        hideOnClick,
        state?.move,
        state?.hide,
      ]
    );

    const onKeyDownProp = useEventCallback(props.onKeyDown);

    const onKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDownProp(event);
        if (event.defaultPrevented) return;
        state?.setMoveType("keyboard");
        if (state?.virtualFocus) return;
        // When the combobox is not working with virtual focus, the items will
        // receive DOM focus. Therefore, pressing printable keys will not fill
        // the text field. So we need to programmatically focus on the text
        // field when the user presses printable keys.
        const printable = event.key.length === 1;
        if (printable || event.key === "Backspace" || event.key === "Delete") {
          const baseElement = state?.baseRef.current;
          if (!baseElement) return;
          queueMicrotask(() => baseElement.focus());
          if (isTextField(baseElement)) {
            // If the combobox element is a text field, we should update the
            // state value with the current's element value. This is necessary
            // because the value may temporarily change based on the currently
            // selected item, but it'll be reset to the original value when the
            // combobox input is focused.
            state?.setValue(baseElement.value);
          }
        }
      },
      [
        onKeyDownProp,
        state?.setMoveType,
        state?.virtualFocus,
        state?.baseRef,
        state?.setValue,
      ]
    );

    const onMouseMoveProp = useEventCallback(props.onMouseMove);

    const onMouseMove = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onMouseMoveProp(event);
        if (event.defaultPrevented) return;
        // If focusOnMouseMove is true or ComboboxItem is combined with another
        // composite item component, we should make sure to set the appropiate
        // moveType on the state so, when combobox.autoComplete is "both" or
        // "inline", we don't change the input value with the active item value.
        // In fact, the combobox.activeValue property will not be updated if
        // moveType is set to "mouse".
        state?.setMoveType("mouse");
      },
      [onMouseMoveProp, state?.setMoveType]
    );

    props = useWrapElement(
      props,
      (element) => (
        <ComboboxItemValueContext.Provider value={value}>
          {element}
        </ComboboxItemValueContext.Provider>
      ),
      [value]
    );

    props = {
      role: getItemRole(state?.contentElement),
      children: value,
      ...props,
      onClick,
      onKeyDown,
      onMouseMove,
    };

    props = useCompositeItem({
      state,
      ...props,
      getItem,
      // We only register the item on the state when the popover is visible so
      // we don't try to move focus to hidden items when pressing arrow keys.
      shouldRegisterItem: state?.mounted && shouldRegisterItem,
    });

    props = useCompositeHover({ state, focusOnMouseMove, ...props });

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
 * @see https://ariakit.org/docs/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxState();
 * <Combobox state={combobox} />
 * <ComboboxPopover state={combobox}>
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

export type ComboboxItemOptions<T extends As = "div"> = Omit<
  CompositeItemOptions<T>,
  "state"
> &
  Omit<CompositeHoverOptions<T>, "state" | "focusOnMouseMove"> & {
    /**
     * Object returned by the `useComboboxState` hook. If not provided, the
     * parent `ComboboxList` or `ComboboxPopover` components' context will be
     * used.
     */
    state?: ComboboxState;
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
    hideOnClick?: boolean;
    /**
     * Whether to set the combobox value with this item's value when this item is
     * clicked.
     * @default true
     */
    setValueOnClick?: boolean;
    /**
     * Whether to focus the combobox item on mouse move.
     * @default false
     */
    focusOnMouseMove?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  };

export type ComboboxItemProps<T extends As = "div"> = Props<
  ComboboxItemOptions<T>
>;
