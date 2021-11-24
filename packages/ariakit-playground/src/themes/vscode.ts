import { css } from "@emotion/css";
import darkTheme from "./vscode-dark";
import lightTheme from "./vscode-light";

const theme = css`
  ${darkTheme}

  @media (prefers-color-scheme: light) {
    ${lightTheme}
  }

  .dark-mode & {
    ${darkTheme}
  }

  .light-mode & {
    ${lightTheme}
  }
`;

export default theme;
