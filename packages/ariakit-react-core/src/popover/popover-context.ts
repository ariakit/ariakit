import { createContext } from "react";
import type { PopoverStore } from "./popover-store.js";

export const PopoverContext = createContext<PopoverStore | undefined>(
  undefined,
);
