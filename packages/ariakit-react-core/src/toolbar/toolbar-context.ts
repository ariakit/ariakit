import { createContext } from "react";
import { ToolbarStore } from "./toolbar-store";

export const ToolbarContext = createContext<ToolbarStore | undefined>(
  undefined
);
