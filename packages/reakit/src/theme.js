import { css } from "styled-components";
import { switchProp, prop } from "styled-tools";
import getUnderlyingElement from "./_utils/getUnderlyingElement";

export const Arrow = css`
  color: rgba(0, 0, 0, 0.85);

  &:after {
    border-width: 1px;
    border-top-width: 0;
    border-left-width: 0;
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
  ${generic.neutralRoundedBorder};
  background-color: rgba(0, 0, 0, 0.03);
  padding: 0 0.68em;
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
  ${generic.neutralRoundedBorder};
`;
export const Heading = css`
  margin: 0.5em 0 0.3em;
  font-size: ${switchProp(getUnderlyingElement, {
    h1: "2em",
    h2: "1.75em",
    h3: "1.5em",
    h4: "1.25em",
    h5: "1em",
    h6: "0.75em"
  })};
`;
export const Image = css`
  max-width: 100%;
`;
export const Input = css`
  ${generic.neutralRoundedBorder};
  display: block;
  width: 100%;
  padding: 0 0.5em;
  height: 2.5em;
  background-color: white;
  &::placeholder {
    color: currentcolor;
    opacity: 0.5;
  }
  textarea& {
    padding: 0.5em;
    height: auto;
  }
  &[type="checkbox"],
  &[type="radio"] {
    width: auto;
    height: auto;
    padding: 0;
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
export const Overlay = css`
  background-color: white;
  left: 50%;
  top: 50%;
`;
export const Paragraph = css`
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
`;
export const Popover = css`
  ${generic.neutralRoundedBorder};
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
  ${generic.neutralRoundedBorder};
  color: white;
  border-top: 0;
  font-size: 1.25em;
  border-radius: 0;
`;
export const Table = css`
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

export const generic = {
  neutralRoundedBorder: css`
    border: 1px solid rgba(0, 0, 0, 0.3);
    border-radius: 0.25em;
  `
};

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
  Image,
  Input,
  Link,
  List,
  Overlay,
  Paragraph,
  Popover,
  PopoverArrow,
  Table,
  Tabs,
  Tooltip,
  TooltipArrow,
  generic
};
