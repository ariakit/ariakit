import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useWarning } from "reakit-warning";
import { useCreateElement } from "reakit-system/useCreateElement";
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

  useProps(options, htmlProps) {
    return {
      ...htmlProps,
      children: options.visible ? htmlProps.children : null,
    };
  },

  useComposeProps(options, { tabIndex, ...htmlProps }) {
    htmlProps = useComboboxMenu(options, htmlProps, true);
    htmlProps = usePopover(options, htmlProps, true);
    return {
      ...htmlProps,
      tabIndex: tabIndex ?? undefined,
    };
  },
});

export const unstable_ComboboxPopover = createComponent({
  as: "div",
  useHook: unstable_useComboboxPopover,
  useCreateElement: (type, props, children) => {
    useWarning(
      !props["aria-label"] && !props["aria-labelledby"],
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/combobox"
    );
    return useCreateElement(type, props, children);
  },
});

export type unstable_ComboboxPopoverOptions = ComboboxMenuOptions &
  Omit<
    PopoverOptions,
    | "unstable_disclosureRef"
    | "unstable_autoFocusOnHide"
    | "unstable_autoFocusOnShow"
  > &
  Pick<Partial<ComboboxPopoverStateReturn>, "unstable_referenceRef">;

export type unstable_ComboboxPopoverHTMLProps = PopoverHTMLProps &
  ComboboxMenuHTMLProps;

export type unstable_ComboboxPopoverProps = unstable_ComboboxPopoverOptions &
  unstable_ComboboxPopoverHTMLProps;
