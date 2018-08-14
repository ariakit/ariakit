import { css } from "styled-components";

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
export const Box = css`
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 0.25em;
`;
export const Button = css`
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
export const Field = css``;
export const Fit = css``;
export const Flex = css``;
export const Grid = css``;
export const Group = css``;
export const Heading = css``;
export const Hidden = css``;
export const Image = css``;
export const Inline = css``;
export const InlineBlock = css``;
export const InlineFlex = css``;
export const Input = css``;
export const Label = css``;
export const Link = css``;
export const List = css``;
export const Navigation = css``;
export const Overlay = css``;
export const Paragraph = css``;
export const Popover = css``;
export const Portal = css``;
export const Shadow = css``;
export const Sidebar = css``;
export const Step = css``;
export const Table = css``;
export const Tabs = css``;
export const Toolbar = css``;
export const Tooltip = css``;

export default {
  Arrow,
  Avatar,
  Backdrop,
  Base,
  Block,
  Blockquote,
  Box,
  Button,
  Card,
  Code,
  Divider,
  Field,
  Fit,
  Flex,
  Grid,
  Group,
  Heading,
  Hidden,
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
  Tooltip
};
