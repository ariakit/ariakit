import { createContext } from "solid-js";

export const FocusableContext = createContext<() => boolean>(() => true);
