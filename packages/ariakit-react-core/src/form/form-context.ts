import { createContext } from "react";
import { FormStore } from "./form-store";

export const FormContext = createContext<FormStore | undefined>(undefined);
