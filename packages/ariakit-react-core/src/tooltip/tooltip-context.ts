import { createContext } from "react";
import { TooltipStore } from "./tooltip-store.js";

export const TooltipContext = createContext<TooltipStore | undefined>(
  undefined
);
