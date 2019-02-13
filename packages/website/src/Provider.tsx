import * as React from "react";
import { ThemeProvider } from "reakit";
import * as theme from "reakit-theme-palette";

// function useBoxProps(_: any, props: any) {
//   props = mergeProps(props, {
//     style: {
//       color: "red"
//     }
//   });
//   return props;
// }

function Provider(props: { children: React.ReactNode }) {
  return <ThemeProvider {...theme}>{props.children}</ThemeProvider>;
}

export default Provider;
