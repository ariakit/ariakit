import { css } from "@emotion/react";
import darkTheme from "./vscode-dark";
import lightTheme from "./vscode-light";

const theme = css`
  && {
    ${lightTheme}
  }

  @media (prefers-color-scheme: dark) {
    ${darkTheme};
  }

  @media (prefers-color-scheme: light) {
    ${lightTheme};
  }

  &.dark,
  .dark & {
    ${darkTheme}
  }

  &.light,
  .light & {
    ${lightTheme}
  }
`;

export default theme;
