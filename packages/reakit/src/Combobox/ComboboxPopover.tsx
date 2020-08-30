import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useLiveRef } from "reakit-utils/useLiveRef";
import {
  PopoverOptions,
  PopoverHTMLProps,
  usePopover,
} from "../Popover/Popover";
import { COMBOBOX_POPOVER_KEYS } from "./__keys";
import {
  unstable_ComboboxMenuOptions as ComboboxMenuOptions,
  unstable_ComboboxMenuHTMLProps as ComboboxMenuHTMLProps,
  unstable_useComboboxMenu as useComboboxMenu,
} from "./ComboboxMenu";
import { ComboboxPopoverStateReturn } from "./__utils/ComboboxPopoverState";

export const unstable_useComboboxPopover = createHook<
  unstable_ComboboxPopoverOptions,
  unstable_ComboboxPopoverHTMLProps
>({
  name: "ComboboxPopover",
  compose: [useComboboxMenu, usePopover],
  keys: COMBOBOX_POPOVER_KEYS,

  useOptions(options) {
    return {
      ...options,
      unstable_disclosureRef: options.unstable_referenceRef,
      unstable_autoFocusOnShow: false,
      unstable_autoFocusOnHide: false,
    };
  },

  useProps(options, { onKeyDown: htmlOnKeyDown, ...htmlProps }) {
    const onKeyDownRef = useLiveRef(htmlOnKeyDown);
    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        onKeyDownRef.current?.(event);
        if (event.defaultPrevented) return;
        if (!options.hideOnEsc) return;
        if (event.key === "Escape") {
          options.hide?.();
        }
      },
      [options.hideOnEsc, options.hide]
    );
    return {
      onKeyDown,
      ...htmlProps,
      children: options.visible ? htmlProps.children : null,
    };
  },

  useComposeProps(options, { tabIndex, ...htmlProps }) {
    htmlProps = useComboboxMenu(options, htmlProps, true);
    htmlProps = usePopover({ ...options, hideOnEsc: false }, htmlProps, true);
    return {
      ...htmlProps,
      tabIndex: tabIndex ?? undefined,
    };
  },
});

// TODO: Should have aria-label
export const unstable_ComboboxPopover = createComponent({
  as: "div",
  useHook: unstable_useComboboxPopover,
});

export type unstable_ComboboxPopoverOptions = Omit<
  PopoverOptions,
  "unstable_autoFocusOnHide" | "unstable_autoFocusOnShow" | "hide"
> &
  Pick<ComboboxPopoverStateReturn, "hide"> &
  Pick<Partial<ComboboxPopoverStateReturn>, "unstable_referenceRef"> &
  ComboboxMenuOptions;

export type unstable_ComboboxPopoverHTMLProps = PopoverHTMLProps &
  ComboboxMenuHTMLProps;

export type unstable_ComboboxPopoverProps = unstable_ComboboxPopoverOptions &
  unstable_ComboboxPopoverHTMLProps;
