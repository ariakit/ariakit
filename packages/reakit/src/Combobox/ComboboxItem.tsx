import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_ComboboxStateReturn } from "./ComboboxState";
import { COMBOBOX_ITEM_KEYS } from "./__keys";

export type unstable_ComboboxItemOptions = BoxOptions &
  Pick<Partial<unstable_ComboboxStateReturn>, "hide"> &
  Pick<unstable_ComboboxStateReturn, "setInputValue" | "setCurrentValue"> & {
    /**
     * Item's value.
     */
    value: string;
  };

export type unstable_ComboboxItemHTMLProps = BoxHTMLProps;

export type unstable_ComboboxItemProps = unstable_ComboboxItemOptions &
  unstable_ComboboxItemHTMLProps;

export const unstable_useComboboxItem = createHook<
  unstable_ComboboxItemOptions,
  unstable_ComboboxItemHTMLProps
>({
  name: "ComboboxItem",
  compose: useBox,
  keys: COMBOBOX_ITEM_KEYS,

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
