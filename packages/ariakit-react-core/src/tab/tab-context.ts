import { createContext } from "react";
import type { TabStore } from "./tab-store.js";

export const TabContext = createContext<TabStore | undefined>(undefined);
