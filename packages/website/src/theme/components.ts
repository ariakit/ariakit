import { css } from "reakit";
import { prop, palette as p, ifProp } from "styled-tools";

export const Blockquote = css`
  color: ${p("alertText", -1)};
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
  box-shadow: 0 0 0 1px ${p("shadow", -2)}, 0 4px 8px ${p("shadow", -2)},
    0 16px 48px ${p("shadow", -2)};
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
