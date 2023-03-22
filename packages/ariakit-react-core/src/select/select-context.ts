import { createContext } from "react";
import { SelectStore } from "./select-store.js";

export const SelectItemCheckedContext = createContext(false);

export const SelectContext = createContext<SelectStore | undefined>(undefined);
