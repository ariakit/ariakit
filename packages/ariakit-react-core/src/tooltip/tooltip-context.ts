import { createContext } from "react";
import { TooltipStore } from "./tooltip-store";

export const TooltipContext = createContext<TooltipStore | undefined>(
  undefined
);
