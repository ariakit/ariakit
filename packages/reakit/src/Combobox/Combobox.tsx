import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import {
  CompositeOptions,
  CompositeHTMLProps,
  useComposite,
} from "../Composite/Composite";
import { COMBOBOX_KEYS } from "./__keys";

export type unstable_ComboboxOptions = CompositeOptions;

export type unstable_ComboboxHTMLProps = CompositeHTMLProps;

export type unstable_ComboboxProps = unstable_ComboboxOptions &
  unstable_ComboboxHTMLProps;

export const unstable_useCombobox = createHook<
  unstable_ComboboxOptions,
  unstable_ComboboxHTMLProps
>({
  name: "Combobox",
  compose: useComposite,
  keys: COMBOBOX_KEYS,

  useProps(_, htmlProps) {
    return { role: "combobox", ...htmlProps };
  },
});

export const unstable_Combobox = createComponent({
  as: "div",
  memo: true,
  useHook: unstable_useCombobox,
});
