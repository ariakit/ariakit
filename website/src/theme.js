import { css } from "reakit";
import { prop } from "styled-tools";

export default {
  pinkLight: "#fd88ce",
  pink: "#fd6099",
  pinkDark: "#fc4577",
  black: "#282b36",
  grayLightest: "#eee",
  grayLight: "#999",
  gray: "#666",
  grayDark: "#333",

  Button: css`
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: #444;
  `,

  Code: css`
    font-family: "Fira Code", monospace;
    font-size: 14px;
    white-space: pre;
    overflow: auto;

    code {
      font-family: inherit;
    }
  `,

  Heading: css`
    line-height: 1.15;
    letter-spacing: -0.015em;
  `,

  Link: css`
    color: ${prop("theme.pinkDark")};
    font-weight: 600;
  `
};
