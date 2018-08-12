import * as styledComponents from "styled-components";

export type Theme = { [key: string]: any };

const {
  default: styled,
  css,
  injectGlobal,
  keyframes,
  ThemeProvider,
  withTheme
} = styledComponents as styledComponents.ThemedStyledComponentsModule<Theme>;

const {
  ServerStyleSheet,
  StyleSheetManager,
  isStyledComponent,
  consolidateStreamedStyles
} = styledComponents;

export {
  css,
  injectGlobal,
  keyframes,
  ThemeProvider,
  withTheme,
  ServerStyleSheet,
  StyleSheetManager,
  isStyledComponent,
  consolidateStreamedStyles
};

export default styled;
