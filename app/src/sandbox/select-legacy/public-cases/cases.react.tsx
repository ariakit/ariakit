import {
  LegacyPublicSelectAutofillCase,
  LegacyPublicSelectCase,
  LegacyPublicSelectDefaultOpenCase,
  LegacyPublicSelectFormCase,
  LegacyPublicSelectFormDisabledCase,
  LegacyPublicSelectItemsUnmountCase,
  LegacyPublicSelectMultipleCase,
} from "./basic.tsx";
import {
  LegacyPublicSelectComboboxCase,
  LegacyPublicSelectComboboxFocusWithinCase,
  LegacyPublicSelectComboboxOffscreenCase,
  LegacyPublicSelectComboboxStoreCase,
  LegacyPublicSelectComboboxTabCase,
  LegacyPublicSelectComboboxTabManualCase,
  LegacyPublicSelectComboboxVirtualizedCase,
} from "./combobox.tsx";
import {
  LegacyPublicSelectAnimatedCase,
  LegacyPublicSelectAnimatedStoreCase,
  LegacyPublicSelectGridCase,
  LegacyPublicSelectGridStoreCase,
  LegacyPublicSelectGroupCase,
  LegacyPublicSelectItemCustomCase,
  LegacyPublicSelectListboxCase,
} from "./composite.tsx";
import {
  LegacyPublicComboboxMultipleSelectCase,
  LegacyPublicComboboxMultipleStoreCase,
  LegacyPublicFormSelectCase,
  LegacyPublicSelectMenuDefaultOpenCase,
  LegacyPublicToolbarSelectCase,
} from "./compositions.tsx";

// Keep this registry in a non-index TSX module so workerd and the preview
// generator do not treat it as their own entry point.
export const legacyPublicSelectCases = {
  "public-select": LegacyPublicSelectCase,
  "public-select-multiple": LegacyPublicSelectMultipleCase,
  "public-select-form": LegacyPublicSelectFormCase,
  "public-select-autofill": LegacyPublicSelectAutofillCase,
  "public-select-form-disabled": LegacyPublicSelectFormDisabledCase,
  "public-select-items-unmount": LegacyPublicSelectItemsUnmountCase,
  "public-select-default-open-controlled": LegacyPublicSelectDefaultOpenCase,
  "public-select-animated": LegacyPublicSelectAnimatedCase,
  "public-select-animated-store": LegacyPublicSelectAnimatedStoreCase,
  "public-select-grid": LegacyPublicSelectGridCase,
  "public-select-grid-store": LegacyPublicSelectGridStoreCase,
  "public-select-group": LegacyPublicSelectGroupCase,
  "public-select-item-custom": LegacyPublicSelectItemCustomCase,
  "public-select-listbox": LegacyPublicSelectListboxCase,
  "public-select-combobox": LegacyPublicSelectComboboxCase,
  "public-select-combobox-store": LegacyPublicSelectComboboxStoreCase,
  "public-select-combobox-virtualized":
    LegacyPublicSelectComboboxVirtualizedCase,
  "public-select-combobox-tab": LegacyPublicSelectComboboxTabCase,
  "public-select-combobox-tab-manual": LegacyPublicSelectComboboxTabManualCase,
  "public-select-combobox-focus-within":
    LegacyPublicSelectComboboxFocusWithinCase,
  "public-select-combobox-offscreen": LegacyPublicSelectComboboxOffscreenCase,
  "public-select-menu-default-open": LegacyPublicSelectMenuDefaultOpenCase,
  "public-toolbar-select": LegacyPublicToolbarSelectCase,
  "public-form-select": LegacyPublicFormSelectCase,
  "public-combobox-multiple-select": LegacyPublicComboboxMultipleSelectCase,
  "public-combobox-multiple-store": LegacyPublicComboboxMultipleStoreCase,
} as const;

export type LegacyPublicSelectCaseName = keyof typeof legacyPublicSelectCases;
