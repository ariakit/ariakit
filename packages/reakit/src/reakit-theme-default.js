import { prop } from "styled-tools";
import { css } from "./styled";

export const neutralRoundedBorder = css`
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 0.25em;
`;
export const Arrow = css`
  color: rgba(0, 0, 0, 0.85);

  &:after {
    border-width: 1px;
  }
`;
export const Avatar = css`
  border-radius: 50%;
  width: 1.5em;
  height: 1.5em;
`;
export const Backdrop = css`
  background-color: rgba(0, 0, 0, 0.3);
`;

export const Button = css`
  ${neutralRoundedBorder};
  background-color: rgba(0, 0, 0, 0.03);
  padding: 0 0.68em;
  position: relative;
  flex: none;
  appearance: none;
  user-select: none;
  outline: none;
  white-space: nowrap;
  text-decoration: none;
  height: 2.5em;
  &:hover,
  &:focus {
    box-shadow: inset 0 0 999em rgba(0, 0, 0, 0.1);
  }
  &:active,
  &.active {
    box-shadow: inset 0 0 999em rgba(0, 0, 0, 0.2);
  }
  &:after {
    background-color: rgba(255, 255, 255, 0.35);
  }
  &:not(button):not(select):not(input) {
    display: inline-grid;
    grid-gap: 0.68em;
    grid-auto-flow: column;
    align-content: center;
  }
`;
export const Card = css`
  background-color: white;
`;
export const Code = css`
  background-color: rgba(0, 0, 0, 0.05);
`;
export const Field = css`
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
  padding: 0 0.5em;
  height: 2.5em;
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
  TooltipArrow,
  neutralRoundedBorder
};
