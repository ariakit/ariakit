import { createContext } from "react";
import { ComboboxStore } from "./combobox-store";

export const ComboboxContext = createContext<ComboboxStore | undefined>(
  undefined
);

export const ComboboxItemValueContext = createContext<string | undefined>(
  undefined
);
