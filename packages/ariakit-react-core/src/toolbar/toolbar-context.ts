import { createContext } from "react";
import type { ToolbarStore } from "./toolbar-store.js";

export const ToolbarContext = createContext<ToolbarStore | undefined>(
  undefined
);
