import * as React from "react";
import { Provider as ReakitProvider, unstable_mergeSystem } from "reakit";
import * as bootstrapSystem from "reakit-system-bootstrap";
import * as playgroundSystem from "reakit-playground/system";

const system = unstable_mergeSystem(bootstrapSystem, playgroundSystem, {
  palette: {
    ...bootstrapSystem.palette,
    primary: "#006DFF",
    link: "#006DFF",
    secondary: "#504984"
  }
});

function Provider(props: { children: React.ReactNode }) {
  return (
    <ReakitProvider unstable_system={system}>{props.children}</ReakitProvider>
  );
}

export default Provider;
