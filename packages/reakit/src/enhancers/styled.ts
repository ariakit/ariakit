// @ts-ignore
import { ComponentClass } from "react";
import * as styledComponents from "styled-components";
// @ts-ignore
import * as components from "../components";

export type Theme = { [key in keyof typeof components]: any };

const {
  default: styled,
  css,
  injectGlobal,
  keyframes,
  ThemeProvider
} = styledComponents as styledComponents.ThemedStyledComponentsModule<Theme>;

export { css, injectGlobal, keyframes, ThemeProvider };

export default styled;
