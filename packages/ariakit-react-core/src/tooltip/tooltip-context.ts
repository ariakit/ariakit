import { createContext } from "react";
import type { TooltipStore } from "./tooltip-store.js";

export const TooltipContext = createContext<TooltipStore | undefined>(
  undefined
);
