import { createContext } from "react";
import { ToolbarStore } from "./toolbar-store.js";

export const ToolbarContext = createContext<ToolbarStore | undefined>(
  undefined
);
