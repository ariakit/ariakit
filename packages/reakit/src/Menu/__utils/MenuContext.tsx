import * as React from "react";
import { MenuStateReturn } from "../MenuState";

export type MenuContextType = Pick<
  MenuStateReturn,
  "orientation" | "unstable_next" | "unstable_previous"
> & {
  parent?: MenuContextType | null;
};

export const MenuContext = React.createContext<MenuContextType | null>(null);
