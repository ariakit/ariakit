import { css } from "reakit";
import { prop, palette as p, ifProp } from "styled-tools";

export const palette = {
  white: "#ffffff",
  whiteText: p("black"),

  black: "#212121",
  blackText: p("white"),

  // https://coolors.co/e91e63-ec407a-f06292-f48fb1-f8bbd0
  primary: ["#fc4577", "#fd6099", "#fd88ce", "#f48fb1", "#f8bbd0"],
  primaryText: [p("white"), p("white"), p("black"), p("black"), p("black")],

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
    p("black"),
    "#414141",
    "#616161",
    "#9e9e9e",
    "#bdbdbd",
    "#eaeaea",
    "#f5f5f5",
    p("white")
  ],
  grayscaleText: [
    p("white"),
    p("white"),
    p("white"),
    p("black"),
    p("black"),
    p("black"),
    p("black"),
    p("black")
  ],

  background: [
    p("grayscale", -4),
    p("grayscale", -3),
    p("grayscale", -2),
    p("grayscale", -1)
  ],
  backgroundText: p("black"),

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

  border: p("shadow", -2)
};

export const Blockquote = css`
  background-color: ${p("alert", -1)};
  border-left-color: ${p("alert", 1)};
  border-left-width: 8px;
  border-left-style: solid;
  padding: 20px 16px;
  margin: 20px -24px;

  @media (max-width: 768px) {
    margin-right: 0;
    padding-right: 8px;
  }
`;

export const Button = css`
  display: inline-flex;
  position: relative;
  appearance: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  min-width: 2.5em;
  height: 2.5em;
  padding: 0 0.68em;
  flex: none;
  user-select: none;
  white-space: nowrap;
  text-decoration: none;
  outline: none;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;

  &:hover,
  &:focus {
    box-shadow: inset 0 0 999em ${p("shadow", -2)};
  }
  &:active,
  &.active {
    box-shadow: inset 0 0 999em ${p("shadow", -3)};
  }
  &:after {
    display: none;
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: inherit;
    background-color: rgba(255, 255, 255, 0.35);
  }
  &[disabled] {
    pointer-events: none;
    &:after {
      display: block;
    }
  }
`;

export const Code = css`
  font-family: "Fira Code", monospace;
  color: ${p("grayscale", 2)};
  font-size: 0.9em;
  white-space: pre-wrap;
  word-wrap: break-word;
  padding: ${ifProp("block", "0", "0.25em 0.35em")};

  code {
    display: block;
    padding: 1em;
  }
`;

export const Heading = css`
  font-weight: bold;
  margin: 1em 0 0.5em;
  line-height: 1.15;
  letter-spacing: -0.015em;
  &:first-child {
    margin-top: 0;
  }
  h1& {
    font-size: 2.5em;
  }
  h2& {
    font-size: 2em;
  }
  h3& {
    font-size: 1.75em;
  }
  h4& {
    font-size: 1.5em;
  }
  h5& {
    font-size: 1.25em;
  }
  h6& {
    font-size: 1em;
  }
`;

export const Input = css`
  display: block;
  width: 100%;
  padding: 0 0.5em;
  height: 2.5em;

  &::placeholder {
    color: currentcolor;
    opacity: 0.5;
  }
`;

export const Link = css`
  display: inline-grid;
  grid-gap: 0.25em;
  align-items: center;
  grid-auto-flow: column;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

export const List = css`
  list-style: none;

  li {
    margin-bottom: 0.35em;
  }
`;

export const Overlay = css`
  padding: 1em;
  border-radius: 0.25em;
  border: 1px solid ${p("border")};
`;

export const Paragraph = css`
  line-height: 1.75;
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
`;

export const Popover = css`
  padding: 1em;
  border-radius: 0.25em;
  border: 1px solid ${p("border")};

  &[aria-hidden="false"] {
    transition-timing-function: ${prop(
      "timing",
      "cubic-bezier(0.25, 0.1, 0.25, 1.5)"
    )};
  }
`;

export const PopoverArrow = css`
  & .stroke {
    fill: ${p("border")};
  }
`;

export const Sidebar = css`
  border-radius: 0;
`;

export const Table = css`
  line-height: 200%;
  border-collapse: collapse;
  table-layout: auto;
  width: 100%;
  margin-bottom: 1em;
  td {
    vertical-align: top;
    padding: 0.5em;
  }
  th {
    padding: 0.5em;
    text-align: left;
    background-color: ${p("background", -1)};
  }
  tr:nth-child(odd) {
    background-color: ${p("background", -2)};
  }
`;

export const Tabs = css`
  list-style: none;
`;

export const Tooltip = css`
  text-transform: none;
  pointer-events: none;
  white-space: nowrap;
  font-size: 0.875em;
  text-align: center;
  box-shadow: none;
  border-radius: 0.25em;
  padding: 0.75em 1em;
`;

export const TooltipArrow = css`
  & .stroke {
    fill: none;
  }
`;

export default {
  palette,
  Blockquote,
  Button,
  Code,
  Heading,
  Input,
  Link,
  List,
  Overlay,
  Paragraph,
  Popover,
  PopoverArrow,
  Sidebar,
  Tabs,
  Table,
  Tooltip,
  TooltipArrow
};
