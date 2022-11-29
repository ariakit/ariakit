import { createContext } from "react";
import { TabStore } from "./tab-store";

export const TabContext = createContext<TabStore | undefined>(undefined);
