import { css } from "reakit";
import { theme, prop, ifProp } from "styled-tools";

// const palette = {
//   primary: ["#1976d2", "#2196f3", "#71bcf7", "#c2e2fb"],
//   secondary: ["#c2185b", "#e91e63", "#f06292", "#f8bbd0"],
//   danger: ["#d32f2f", "#f44336", "#f8877f", "#ffcdd2"],
//   alert: ["#ffa000", "#ffc107", "#ffd761", "#ffecb3"],
//   success: ["#388e3c", "#4caf50", "#7cc47f", "#c8e6c9"],
//   white: ["#fff", "#fff", "#eee"],
//   grayscale: [
//     "#212121",
//     "#414141",
//     "#616161",
//     "#9e9e9e",
//     "#bdbdbd",
//     "#e0e0e0",
//     "#eeeeee",
//     "#ffffff"
//   ],
//   text: theme("black"),
//   reverseText: palette("primary", 1, "#aaa")
// };

// palette(1, "#aaa")({ palette: "primary" });
// palette("primary", -1, "#aaa")();

export const values = {
  primary: "blue",
  primaryDark: "darkblue",
  black: "#222",
  white: "#fff",
  grayLightest: "#eee",
  grayLighter: "#ccc",
  grayLight: "#aaa",
  gray: "#888",
  grayDark: "#666",
  grayDarker: "#444",
  grayDarkest: "#222",
  primaryTextColor: theme("white"),
  borderColor: theme("grayLighter"),
  borderDisabledColor: theme("grayLightest"),
  textColor: theme("black"),
  borderWidth: "1px",
  borderRadius: "0.25em"
};

const t = (key: keyof typeof values) => theme(key, values[key]);

export const neutralRoundedBorder = css`
  border: ${t("borderWidth")} solid ${t("borderColor")};
  border-radius: ${t("borderRadius")};
`;

export const Arrow = css`
  color: ${t("black")};
  &:after {
    border-width: ${t("borderWidth")};
  }
`;

export const Avatar = css`
  border-radius: 50%;
  width: 1.5em;
  height: 1.5em;
  overflow: hidden;
  object-fit: cover;
`;

export const Backdrop = css`
  background-color: rgba(0, 0, 0, 0.3);
`;

export const Button = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  min-width: 2.5em;
  padding: 0 0.68em;
  position: relative;
  flex: none;
  appearance: none;
  user-select: none;
  outline: none;
  white-space: nowrap;
  text-decoration: none;
  height: 2.5em;
  &[disabled] {
    pointer-events: none;
    &:after {
      display: block;
    }
  }
`;

export const Card = css`
  background-color: white;
`;

export const Code = css`
  background-color: rgba(0, 0, 0, 0.05);
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  padding: ${ifProp("block", "0", "0.25em 0.35em")};

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
  ${neutralRoundedBorder};
`;
export const Heading = css`
  margin: 0.5em 0 0.3em;
`;
export const Input = css`
  ${neutralRoundedBorder};
  display: block;
  width: 100%;
  padding: 0 0.5em;
  height: 2.5em;
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
  color: #0366d6;
  text-decoration: none;

  &:hover {
    outline-width: 0;
    text-decoration: underline;
  }
`;
export const List = css`
  list-style: none;

  li {
    margin-bottom: 0.35em;
  }
`;
export const Paragraph = css`
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
`;
export const Popover = css`
  ${neutralRoundedBorder};
  color: inherit;
  padding: 1em;
  background-color: white;
  outline: 0;
  &[aria-hidden="false"] {
    transition-timing-function: ${prop(
      "timing",
      "cubic-bezier(0.25, 0.1, 0.25, 1.5)"
    )};
  }
`;
export const PopoverArrow = css`
  ${neutralRoundedBorder};
  color: white;
  border-top: 0;
  font-size: 1.25em;
  border-radius: 0;
`;
export const Table = css`
  ${neutralRoundedBorder};
  table-layout: fixed;
  border-collapse: collapse;
  background-color: white;
  border: 1px solid #bbb;
  line-height: 200%;
  display: table;

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
    color: #999;
  }

  td,
  th {
    padding: 0 8px;
    vertical-align: middle;
  }

  th {
    font-weight: bold;
    background-color: rgba(0, 0, 0, 0.05);
  }
`;
export const Tabs = css`
  display: flex;
  align-items: center;
  list-style: none;
`;
export const Tooltip = css`
  text-transform: none;
  font-size: 0.875em;
  text-align: center;
  color: white;
  background-color: #222;
  border-radius: 0.15384em;
  padding: 0.75em 1em;
`;

export const TooltipArrow = css`
  color: #222;
  border: none;
`;

export default {
  ...values,
  neutralRoundedBorder,
  Arrow,
  Avatar,
  Backdrop,
  Button,
  Card,
  Code,
  Field,
  GroupItem,
  Heading,
  Input,
  Link,
  List,
  Paragraph,
  Popover,
  PopoverArrow,
  Table,
  Tabs,
  Tooltip,
  TooltipArrow
};
