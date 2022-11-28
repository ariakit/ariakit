import { createContext } from "react";
import { RadioStore } from "./radio-store";

export const RadioContext = createContext<RadioStore | undefined>(undefined);
