import type { Setter } from "solid-js";
import { createContext } from "solid-js";

export const GroupLabelContext = createContext<Setter<string | undefined>>();
