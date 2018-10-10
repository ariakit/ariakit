import { css } from "reakit";
import { palette as p } from "styled-tools";
import * as components from "./components";

export const palette = {
  white: "#ffffff",
  whiteText: p("black"),

  black: "#212121",
  blackText: p("white"),

  primary: ["#fc4678", "#fd6199", "#fd88ce"],
  primaryText: [p("white"), p("white"), p("black")],

  // https://coolors.co/f44336-ef5350-e57373-ef9a9a-ffcdd2
  danger: ["#f44336", "#ef5350", "#e57373", "#ef9a9a", "#ffcdd2"],
  dangerText: [p("white"), p("white"), p("black"), p("black"), p("black")],

  // https://coolors.co/ffdd32-ffe566-ffeb8c-fff2b2-fff8d8
  alert: ["#ffdd32", "#ffe566", "#ffeb8c", "#fff2b2", "#fff8d8"],
  alertText: [p("black"), p("black"), p("black"), p("black"), p("black")],

  // https://coolors.co/4caf50-66bb6a-81c784-a5d6a7-c8e6c9
  success: ["#4caf50", "#66bb6a", "#81c784", "#a5d6a7", "#c8e6c9"],
  successText: [p("white"), p("white"), p("white"), p("black"), p("black")],

  grayscale: [
    p("white"),
    "#f5f5f5",
    "#eaeaea",
    "#bdbdbd",
    "#9e9e9e",
    "#616161",
    "#414141",
    p("black")
  ],
  grayscaleText: [
    p("black"),
    p("black"),
    p("black"),
    p("black"),
    p("black"),
    p("white"),
    p("white"),
    p("white")
  ],

  background: ["#595c7f", "#505372", "#474a66", "#3e4159", "#2f313f"],
  backgroundText: p("white"),

  shadow: [
    "rgba(0, 0, 0, 0.9)",
    "rgba(0, 0, 0, 0.7)",
    "rgba(0, 0, 0, 0.5)",
    "rgba(0, 0, 0, 0.3)",
    "rgba(0, 0, 0, 0.15)",
    "rgba(0, 0, 0, 0.075)"
  ],
  shadowText: [
    p("white"),
    p("white"),
    p("white"),
    p("black"),
    p("black"),
    p("black")
  ],

  transparent: "transparent",
  transparentText: p("black"),

  border: p("background", 1)
};

export default {
  palette,

  ...components,

  Link: css`
    ${components.Link};
    color: ${p("primary", -1)};
  `,

  Blockquote: css`
    ${components.Blockquote};
    a {
      color: ${p("primary", 0)};
    }
  `
};
