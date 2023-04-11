import { createContext } from "react";
import type { ComboboxStore } from "./combobox-store.js";

export const ComboboxContext = createContext<ComboboxStore | undefined>(
  undefined
);

export const ComboboxItemValueContext = createContext<string | undefined>(
  undefined
);
