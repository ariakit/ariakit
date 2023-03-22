import { createContext } from "react";
import { FormStore } from "./form-store.js";

export const FormContext = createContext<FormStore | undefined>(undefined);
