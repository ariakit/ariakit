import * as React from "react";
import { ThemeProvider, mergeProps, mergeTheme } from "reakit";
import * as theme from "reakit-theme-palette";

function useBox(_: any, props: any) {
  return mergeProps(
    {
      style: {
        color: "red"
      }
    },
    props
  );
}

const myTheme = {
  hooks: {
    useBox
  }
};

function CoreLayout(props: { children: React.ReactNode }) {
  return (
    <React.StrictMode>
      <ThemeProvider {...theme}>{props.children}</ThemeProvider>
    </React.StrictMode>
  );
}

export default CoreLayout;
