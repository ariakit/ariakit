import * as React from "react";
import ThemeContext from "./ThemeContext";

export function useThemeProps<
  P extends React.HTMLAttributes<any> = React.HTMLAttributes<any>
>(hook: string, options: any, props = {} as P) {
  const context = React.useContext(ThemeContext);
  if (hook in context) {
    return context[hook](options, props);
  }
  return props;
}

export default useThemeProps;
