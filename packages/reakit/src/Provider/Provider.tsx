import * as React from "react";
import * as PropTypes from "prop-types";
import {
  Provider as ConstateProvider,
  ProviderProps as ConstateProps
} from "constate";
import { ThemeProvider, ThemeProviderProps } from "../styled";

interface ComponentProps
  extends ConstateProps<{ [key: string]: any }>,
    ThemeProviderProps<Object> {
  children: React.ReactNode;
}

const Provider: React.SFC<ComponentProps> = ({ theme, children, ...props }) => (
  <ConstateProvider {...props}>
    {theme ? <ThemeProvider theme={theme}>{children}</ThemeProvider> : children}
  </ConstateProvider>
);

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
