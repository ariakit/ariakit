import * as React from "react";
import ThemeContext, { ThemeContextType } from "./ThemeContext";

export type ThemeProviderProps = {
  theme: ThemeContextType;
  children: React.ReactNode;
};

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const value = React.useMemo(() => theme, []);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export default ThemeProvider;
