import { createContext } from "react";
import { createStoreContext } from "ariakit-utils/store";
import { ComboboxState } from "./combobox-state";

export const ComboboxContext = createStoreContext<ComboboxState>();

export const ComboboxItemValueContext = createContext<string | undefined>(
  undefined
);
