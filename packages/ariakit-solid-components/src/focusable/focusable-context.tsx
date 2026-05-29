import type { Accessor } from "solid-js";
import { createContext } from "solid-js";

export const FocusableContext = createContext<Accessor<boolean>>(() => true);
