import { css } from "reakit";
import { prop, palette as p, ifProp } from "styled-tools";

export const palette = {
  white: "#ffffff",
  whiteText: p("black"),

  black: "#212121",
  blackText: p("white"),

  // https://coolors.co/2196f3-42a5f5-64b5f6-90caf9-bbdefb
  primary: ["#2196f3", "#42a5f5", "#64b5f6", "#90caf9", "#bbdefb"],
  primaryText: [p("white"), p("white"), p("black"), p("black"), p("black")],

  // https://coolors.co/e91e63-ec407a-f06292-f48fb1-f8bbd0
  secondary: ["#e91e63", "#ec407a", "#f06292", "#f48fb1", "#f8bbd0"],
  secondaryText: [p("white"), p("white"), p("black"), p("black"), p("black")],

  // https://coolors.co/f44336-ef5350-e57373-ef9a9a-ffcdd2
  danger: ["#f44336", "#ef5350", "#e57373", "#ef9a9a", "#ffcdd2"],
  dangerText: [p("white"), p("white"), p("black"), p("black"), p("black")],

  // https://coolors.co/ffc107-ffca28-ffd54f-ffe082-ffecb3
  alert: ["#ffc107", "#ffca28", "#ffd54f", "#ffe082", "#ffecb3"],
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
    "#e0e0e0",
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

export const Avatar = css`
  border-radius: 50%;
  width: 1.5em;
  height: 1.5em;
  overflow: hidden;
  object-fit: cover;
`;

export const Blockquote = css`
  border-left: 5px solid ${p("grayscale", -3)};
  padding: 0.5em 0 0.5em 1em;
  font-style: italic;
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
  border-radius: 0.25em;
  flex: none;
  user-select: none;
  white-space: nowrap;
  text-decoration: none;
  outline: none;
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
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  padding: ${ifProp("block", "0", "0.25em 0.35em")};
  border-radius: 0.25em;

  code {
    display: block;
    padding: 1em;
  }
`;

export const Field = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  label {
    padding-bottom: 0.5em;
  }
  > *:not(label):not(:last-child) {
    margin-bottom: 0.5em;
  }
`;

export const GroupItem = css`
  border: 1px solid ${p("border")};
  border-radius: 0.25em;
`;

export const Heading = css`
  font-weight: bold;
  margin: 1em 0 0.5em;
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

export const Image = css`
  display: block;
  max-width: 100%;
`;

export const Input = css`
  display: block;
  width: 100%;
  padding: 0 0.5em;
  height: 2.5em;
  border-radius: 0.25em;

  &[type="checkbox"],
  &[type="radio"] {
    display: inline-block;
    width: auto;
    height: auto;
    padding: 0;
  }

  &::placeholder {
    color: currentcolor;
    opacity: 0.5;
  }

  textarea & {
    padding: 0.5em;
    height: auto;
  }
`;

export const Link = css`
  display: inline-grid;
  grid-gap: 0.25em;
  align-items: center;
  grid-auto-flow: column;
  text-decoration: none;

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
  box-shadow: 0 0 0 1px ${p("shadow", -2)}, 0 4px 8px ${p("shadow", -2)},
    0 16px 48px ${p("shadow", -2)};
`;

export const Paragraph = css`
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
`;

export const Popover = css`
  padding: 1em;
  border-radius: 0.25em;
  box-shadow: 0 0 0 1px ${p("shadow", -2)}, 0 2px 4px ${p("shadow", -1)},
    0 8px 24px ${p("shadow", -1)};

  &[aria-hidden="false"] {
    transition-timing-function: ${prop(
      "timing",
      "cubic-bezier(0.25, 0.1, 0.25, 1.5)"
    )};
  }
`;

export const PopoverArrow = css`
  & .stroke {
    fill: ${p("shadow", -2)};
  }
`;

export const Sidebar = css`
  border-radius: 0;
`;

export const Table = css`
  border: 1px solid ${p("grayscale", 4)};
  table-layout: fixed;
  border-collapse: collapse;
  background-color: ${p("background", -1)};
  line-height: 200%;

  tbody,
  td,
  th,
  tfoot,
  thead,
  tr {
    border: inherit;
  }

  caption {
    text-transform: uppercase;
    font-size: 0.9em;
    color: ${p("grayscale", 3)};
  }

  td,
  th {
    padding: 0 8px;
    vertical-align: middle;
  }

  th {
    font-weight: bold;
    background-color: ${p("shadow", -1)};
  }
`;

export const Tabs = css`
  display: flex;
  align-items: center;
  list-style: none;
`;

export const TabsTab = css`
  display: inline-flex;
  position: relative;
  flex: 1;
  user-select: none;
  outline: none;
  align-items: center;
  white-space: nowrap;
  justify-content: center;
  text-decoration: none;
  height: 2.5em;
  padding: 0 0.5em;
  min-width: 2.5em;
  &.active {
    font-weight: bold;
  }
  &[disabled] {
    pointer-events: none;
  }
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
  Avatar,
  Blockquote,
  Button,
  Code,
  Field,
  GroupItem,
  Heading,
  Image,
  Input,
  Link,
  List,
  Overlay,
  Paragraph,
  Popover,
  PopoverArrow,
  Sidebar,
  Table,
  Tabs,
  TabsTab,
  Tooltip,
  TooltipArrow
};
