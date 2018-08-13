import { ThemeProvider } from "styled-components";
import { Provider as ConstateProvider } from "constate";
import PropTypes from "prop-types";
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

Provider.propTypes = {
  initialState: PropTypes.object,
  onMount: PropTypes.func,
  onUpdate: PropTypes.func,
  onUnmount: PropTypes.func,
  theme: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  children: PropTypes.any,
  devtools: PropTypes.bool
};

export default Provider;
