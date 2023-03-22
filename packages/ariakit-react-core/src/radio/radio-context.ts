import { createContext } from "react";
import { RadioStore } from "./radio-store.js";

export const RadioContext = createContext<RadioStore | undefined>(undefined);
