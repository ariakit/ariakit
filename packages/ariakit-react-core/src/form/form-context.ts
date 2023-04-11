import { createContext } from "react";
import type { FormStore } from "./form-store.js";

export const FormContext = createContext<FormStore | undefined>(undefined);
