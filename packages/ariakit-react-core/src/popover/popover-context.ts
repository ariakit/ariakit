import { createContext } from "react";
import { PopoverStore } from "./popover-store.js";

export const PopoverContext = createContext<PopoverStore | undefined>(
  undefined
);
