import { createContext } from "react";
import { PopoverStore } from "./popover-store";

export const PopoverContext = createContext<PopoverStore | undefined>(
  undefined
);
