import { createContext, type Setter } from "solid-js";

export const GroupLabelContext = createContext<Setter<string | undefined>>();
