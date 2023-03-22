import { css } from "@emotion/react";
import darkTheme from "./vscode-dark.js";
import lightTheme from "./vscode-light.js";

const theme = css`
  ${lightTheme}

  .dark & {
    ${darkTheme}
  }
`;

export default theme;
