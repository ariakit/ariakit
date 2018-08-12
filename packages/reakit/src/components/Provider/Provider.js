import { ThemeProvider } from "styled-components";
import { Provider as ConstateProvider } from "constate";
import React from "react";

const Provider = props => (
  <ConstateProvider {...props}>
    {props.theme ? (
      <ThemeProvider theme={props.theme}>{props.children}</ThemeProvider>
    ) : (
      props.children
    )}
  </ConstateProvider>
);

export default Provider;
