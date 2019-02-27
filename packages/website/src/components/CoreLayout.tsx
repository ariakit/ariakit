import * as React from "react";
import { Provider } from "reakit";
import * as system from "reakit-system-palette";

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

// const mysystem = {
//   hooks: {
//     useBox
//   }
// };

function CoreLayout(props: { children: React.ReactNode }) {
  return (
    <React.StrictMode>
      <Provider system={system}>{props.children}</Provider>
    </React.StrictMode>
  );
}

export default CoreLayout;
