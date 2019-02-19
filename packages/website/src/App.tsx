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

function App(props: { children: React.ReactNode }) {
  return (
    <React.StrictMode>
      <ThemeProvider {...theme}>{props.children}</ThemeProvider>
    </React.StrictMode>
  );
}

export default App;
