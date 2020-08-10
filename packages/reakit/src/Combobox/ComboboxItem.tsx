import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import {
  CompositeItemOptions,
  CompositeItemHTMLProps,
} from "../Composite/CompositeItem";
import { unstable_ComboboxStateReturn } from "./ComboboxState";
import { COMBOBOX_ITEM_KEYS } from "./__keys";
import { getItemId } from "./__utils/getItemId";

export type unstable_ComboboxItemOptions = BoxOptions &
  CompositeItemOptions &
  Pick<Partial<unstable_ComboboxStateReturn>, "currentValue" | "hide"> &
  Pick<unstable_ComboboxStateReturn, "setInputValue" | "setCurrentValue"> & {
    /**
     * Item's value.
     */
    value: string;
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

  // propsAreEqual(prev, next) {
  //   if (prev.value !== next.value) {
  //     return false;
  //   }
  //   if (!prev.baseId || !next.baseId) {
  //     return useCompositeItem.unstable_propsAreEqual(prev, next);
  //   }
  //   const { currentValue: prevCurrentValue, ...prevProps } = prev;
  //   const { currentValue: nextCurrentValue, ...nextProps } = prev;
  //   // if (prevCurrentValue !== nextCurrentValue) {
  //   //   if (next.value === prevCurrentValue || next.value === nextCurrentValue) {
  //   //     return false;
  //   //   }
  //   // }
  //   const prevId = getItemId(prev.baseId, prev.value);
  //   const nextId = getItemId(next.baseId, next.value);
  //   return useCompositeItem.unstable_propsAreEqual(
  //     { ...prev, id: prevId },
  //     { ...next, id: nextId }
  //   );
  // },

  useOptions(options) {
    if (!options.baseId || options.id) {
      return options;
    }
    const id = getItemId(options.baseId, options.value);
    return { ...options, id };
  },

  useProps(
    options,
    { onClick: htmlOnClick, onFocus: htmlOnFocus, ...htmlProps }
  ) {
    const onClickRef = useLiveRef(htmlOnClick);
    const onFocusRef = useLiveRef(htmlOnFocus);

    const onClick = React.useCallback(
      (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        onClickRef.current?.(event);
        if (event.defaultPrevented) return;
        options.hide?.();
        options.setInputValue?.(options.value);
      },
      [options.hide, options.setInputValue, options.value]
    );

    const onFocus = React.useCallback(
      (event: React.FocusEvent<HTMLElement>) => {
        onFocusRef.current?.(event);
        if (event.defaultPrevented) return;
        options.setCurrentValue?.(options.value);
      },
      [options.setCurrentValue, options.value]
    );

    return {
      children: options.value,
      onClick,
      onFocus,
      ...htmlProps,
    };
  },
});

export const unstable_ComboboxItem = createComponent({
  as: "span",
  memo: true,
  useHook: unstable_useComboboxItem,
});
