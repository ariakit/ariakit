import { css } from "@emotion/react";
import darkTheme from "./vscode-dark";
import lightTheme from "./vscode-light";

const theme = css`
  ${lightTheme}

  .dark & {
    ${darkTheme}
  }
`;

export default theme;
