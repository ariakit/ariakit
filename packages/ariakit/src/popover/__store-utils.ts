import { createContext } from "react";
import { PopoverStore } from "./store-popover-store";

export const PopoverContext = createContext<PopoverStore | undefined>(
  undefined
);
