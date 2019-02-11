import * as React from "react";

export type ThemeContextType = Record<
  string,
  <P extends React.HTMLAttributes<any>>(options: any, props?: P) => P
>;

export const ThemeContext = React.createContext<ThemeContextType>({});

export default ThemeContext;
