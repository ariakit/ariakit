import { createContext } from "react";
import { PopoverState } from "./popover-state";

export const PopoverContext = createContext<PopoverState | undefined>(
  undefined
);
