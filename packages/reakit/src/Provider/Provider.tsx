/* eslint-disable react/prefer-stateless-function */
import * as React from "react";
import * as PropTypes from "prop-types";
import {
  Provider as ConstateProvider,
  ProviderProps as ConstateProps
} from "constate";
import { ThemeProvider } from "../styled";

export interface ProviderProps<S, T> extends ConstateProps<S> {
  theme?: T | ((theme: T) => T);
  children: React.ReactChild;
}

class Provider<S, T extends object> extends React.Component<
  ProviderProps<S, T>
> {
  static propTypes = {
    initialState: PropTypes.object,
    onMount: PropTypes.func,
    onUpdate: PropTypes.func,
    onUnmount: PropTypes.func,
    theme: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    children: PropTypes.node,
    devtools: PropTypes.bool
  };

  static defaultProps = {
    initialState: {}
  };

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

export default Provider;
