import * as React from "react";
import { ThemeProvider, mergeProps } from "reakit";

function useBoxProps(_: any, props: any) {
  props = mergeProps(props, {
    style: {
      color: "red"
    }
  });
  return props;
}

function Provider(props: { children: React.ReactNode }) {
  return (
    <ThemeProvider hooks={{ useBoxProps }}>{props.children}</ThemeProvider>
  );
}

export default Provider;
