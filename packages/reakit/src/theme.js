import { css } from "styled-components";
import { switchProp } from "styled-tools";
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
export const Base = css``;
export const Block = css``;
export const Blockquote = css``;
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
export const Divider = css``;
export const Field = css`
  label {
    padding-bottom: 0.5em;
  }
  > *:not(label):not(:last-child) {
    margin-bottom: 0.5em;
  }
`;
export const Flex = css``;
export const Group = css``;
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
export const Inline = css``;
export const InlineBlock = css``;
export const InlineFlex = css``;
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
export const Label = css``;
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
export const List = css``;
export const Navigation = css``;
export const Overlay = css``;
export const Paragraph = css``;
export const Popover = css`
  ${generic.neutralRoundedBorder};
`;
export const PopoverArrow = css`
  ${generic.neutralRoundedBorder};
`;
export const Portal = css``;
export const Shadow = css``;
export const Sidebar = css``;
export const Step = css``;
export const Table = css``;
export const Tabs = css``;
export const Toolbar = css``;
export const Tooltip = css``;

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
  Base,
  Block,
  Blockquote,
  Button,
  Card,
  Code,
  Divider,
  Field,
  Flex,
  Group,
  Heading,
  Image,
  Inline,
  InlineBlock,
  InlineFlex,
  Input,
  Label,
  Link,
  List,
  Navigation,
  Overlay,
  Paragraph,
  Popover,
  Portal,
  Shadow,
  Sidebar,
  Step,
  Table,
  Tabs,
  Toolbar,
  Tooltip,
  generic
};
