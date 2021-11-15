import { createContext } from "react";
import { ToolbarState } from "./toolbar-state";

export const ToolbarContext = createContext<ToolbarState | undefined>(
  undefined
);
