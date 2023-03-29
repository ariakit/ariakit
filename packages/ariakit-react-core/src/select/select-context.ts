import { createContext } from "react";
import type { SelectStore } from "./select-store.js";

export const SelectItemCheckedContext = createContext(false);

export const SelectContext = createContext<SelectStore | undefined>(undefined);
