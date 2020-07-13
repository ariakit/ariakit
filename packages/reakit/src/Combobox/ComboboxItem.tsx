import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { COMBOBOX_ITEM_KEYS } from "./__keys";
import { unstable_ComboboxPopoverStateReturn } from "./ComboboxPopoverState";

export type unstable_ComboboxItemOptions = BoxOptions &
  Pick<Partial<unstable_ComboboxPopoverStateReturn>, "hide"> &
  Pick<
    unstable_ComboboxPopoverStateReturn,
    "setCurrentValue" | "setSelectedValue"
  > & {
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
        options.setCurrentValue?.(options.value);
      },
      [options.hide, options.setCurrentValue, options.value]
    );

    const onFocus = React.useCallback(
      (event: React.FocusEvent<HTMLElement>) => {
        onFocusRef.current?.(event);
        if (event.defaultPrevented) return;
        options.setSelectedValue?.(options.value);
      },
      [options.setSelectedValue, options.value]
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
