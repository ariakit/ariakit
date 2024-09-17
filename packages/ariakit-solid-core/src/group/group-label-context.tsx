import { type Setter, createContext } from "solid-js";

export const GroupLabelContext = createContext<Setter<string | undefined>>();
