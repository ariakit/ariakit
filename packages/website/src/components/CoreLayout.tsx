import * as React from "react";
import { Provider, unstable_mergeSystem as mergeSystem } from "reakit";
import * as bootstrapSystem from "reakit-system-bootstrap";
import * as playgroundSystem from "reakit-playground/system";

const system = mergeSystem(bootstrapSystem, playgroundSystem);

function CoreLayout(props: { children: React.ReactNode }) {
  return (
    <React.StrictMode>
      <Provider unstable_system={system}>{props.children}</Provider>
    </React.StrictMode>
  );
}

export default CoreLayout;
