import * as React from "react";
import { Provider } from "reakit";
import * as theme from "reakit-theme-palette";

// function useBox(_: any, props: any) {
//   return mergeProps(
//     {
//       style: {
//         color: "red"
//       }
//     },
//     props
//   );
// }

// const myTheme = {
//   hooks: {
//     useBox
//   }
// };

function CoreLayout(props: { children: React.ReactNode }) {
  return (
    <React.StrictMode>
      <Provider {...theme}>{props.children}</Provider>
    </React.StrictMode>
  );
}

export default CoreLayout;
