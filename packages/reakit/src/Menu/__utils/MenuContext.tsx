import * as React from "react";
import { unstable_MenuStateReturn } from "../MenuState";

export type MenuContextType = unstable_MenuStateReturn & {
  parent?: MenuContextType | null;
};

export const MenuContext = React.createContext<MenuContextType | null>(null);
