import * as React from "react";
import { Provider } from "reakit";
import * as system from "reakit-system-bootstrap";

function CoreLayout(props: { children: React.ReactNode }) {
  return (
    <React.StrictMode>
      <Provider unstable_system={system}>{props.children}</Provider>
    </React.StrictMode>
  );
}

export default CoreLayout;
