import { createContext } from "react";
import { createStoreContext } from "ariakit-react-utils/store";
import { ComboboxStore } from "./store-combobox-store";

export const ComboboxContext = createStoreContext<ComboboxStore>();

export const ComboboxItemValueContext = createContext<string | undefined>(
  undefined
);
