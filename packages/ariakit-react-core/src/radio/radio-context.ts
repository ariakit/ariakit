import { createContext } from "react";
import type { RadioStore } from "./radio-store.js";

export const RadioContext = createContext<RadioStore | undefined>(undefined);
