/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import * as PropTypes from "prop-types";
import {
  Provider as ConstateProvider,
  ProviderProps as ConstateProps
} from "constate";
import { ThemeProvider, ThemeProviderProps } from "../styled";

export interface ProviderProps<S extends { [key: string]: any }>
  extends ConstateProps<S>,
    ThemeProviderProps<Object> {
  children: React.ReactNode;
}

class Provider<S> extends React.Component<ProviderProps<S>> {
  render() {
    const { theme, children, ...props } = this.props;
    return (
      <ConstateProvider {...props}>
        {theme ? (
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        ) : (
          children
        )}
      </ConstateProvider>
    );
  }
}

// @ts-ignore
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
