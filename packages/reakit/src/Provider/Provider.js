import React from "react";
import PropTypes from "prop-types";
import { Provider as ConstateProvider } from "constate";
import { ThemeProvider } from "../styled";

const Provider = ({ theme, children, ...props }) => (
  <ConstateProvider {...props}>
    {theme ? <ThemeProvider theme={theme}>{children}</ThemeProvider> : children}
  </ConstateProvider>
);

Provider.propTypes = {
  initialState: PropTypes.object,
  onMount: PropTypes.func,
  onUpdate: PropTypes.func,
  onUnmount: PropTypes.func,
  theme: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  children: PropTypes.node,
  devtools: PropTypes.bool
};

export default Provider;
