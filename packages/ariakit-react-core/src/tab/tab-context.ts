import { createContext } from "react";
import { TabStore } from "./tab-store.js";

export const TabContext = createContext<TabStore | undefined>(undefined);
