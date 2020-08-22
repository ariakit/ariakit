import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import {
  CompositeItemOptions,
  CompositeItemHTMLProps,
  useCompositeItem,
} from "../Composite/CompositeItem";
import { unstable_ComboboxStateReturn } from "./ComboboxState";
import { COMBOBOX_ITEM_KEYS } from "./__keys";
import { getItemId } from "./__utils/getItemId";
import { Item } from "./__utils/types";

export type unstable_ComboboxItemOptions = BoxOptions &
  CompositeItemOptions &
  Pick<Partial<unstable_ComboboxStateReturn>, "currentValue" | "hide"> &
  Pick<unstable_ComboboxStateReturn, "setInputValue" | "registerItem"> & {
    /**
     * Item's value.
     */
    value?: string;
  };

export type unstable_ComboboxItemHTMLProps = BoxHTMLProps &
  CompositeItemHTMLProps;

export type unstable_ComboboxItemProps = unstable_ComboboxItemOptions &
  unstable_ComboboxItemHTMLProps;

export const unstable_useComboboxItem = createHook<
  unstable_ComboboxItemOptions,
  unstable_ComboboxItemHTMLProps
>({
  name: "ComboboxItem",
  compose: useBox,
  keys: COMBOBOX_ITEM_KEYS,

  propsAreEqual(prev, next) {
    if (prev.value !== next.value) return false;
    if (!prev.value || !next.value || !prev.baseId || !next.baseId) {
      return useCompositeItem.unstable_propsAreEqual(prev, next);
    }
    const { currentValue: prevCurrentValue, ...prevProps } = prev;
    const { currentValue: nextCurrentValue, ...nextProps } = next;
    if (prevCurrentValue !== nextCurrentValue) {
      if (next.value === prevCurrentValue || next.value === nextCurrentValue) {
        return false;
      }
    }
    const prevId = getItemId(prev.baseId, prev.value, prev.id);
    const nextId = getItemId(next.baseId, next.value, prev.id);
    return useCompositeItem.unstable_propsAreEqual(
      { ...prevProps, id: prevId },
      { ...nextProps, id: nextId }
    );
  },

  useOptions(options) {
    const trulyDisabled = options.disabled && !options.focusable;
    const value = trulyDisabled ? undefined : options.value;

    const registerItem = React.useCallback(
      (item: Item) => options.registerItem({ ...item, value }),
      [options.registerItem, value]
    );

    if (options.id || !options.baseId || !options.value) {
      return { ...options, registerItem };
    }

    const id = getItemId(options.baseId, options.value, options.id);
    return { ...options, registerItem, id };
  },

  useProps(options, { onClick: htmlOnClick, ...htmlProps }) {
    const onClickRef = useLiveRef(htmlOnClick);

    const onClick = React.useCallback(
      (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        onClickRef.current?.(event);
        if (event.defaultPrevented) return;
        if (!options.value) return;
        options.hide?.();
        options.setInputValue?.(options.value);
      },
      [options.hide, options.setInputValue, options.value]
    );

    return {
      children: options.value,
      onClick,
      ...htmlProps,
    };
  },
});

export const unstable_ComboboxItem = createComponent({
  as: "span",
  memo: true,
  useHook: unstable_useComboboxItem,
});
