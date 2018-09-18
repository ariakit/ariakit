import "jest-styled-components";
import * as React from "react";
import { render } from "react-testing-library";
import * as c from "..";

jest.spyOn(console, "error").mockImplementation((...args) => {
  if (/Failed prop type/.test(args[0])) return;
  // eslint-disable-next-line no-console
  console.error(...args);
});

const componentsToTest = [
  c.Avatar,
  c.Backdrop,
  c.Block,
  c.Blockquote,
  c.Box,
  c.Button,
  c.Card,
  c.Card.Fit,
  c.Code,
  c.Divider,
  c.Field,
  c.Flex,
  c.Grid,
  c.Group,
  // @ts-ignore
  c.Group.Item,
  c.Heading,
  c.Hidden,
  c.Hidden.Hide,
  c.Hidden.Show,
  c.Hidden.Toggle,
  c.Image,
  c.Inline,
  c.InlineBlock,
  c.InlineFlex,
  c.Input,
  c.Label,
  c.Link,
  c.List,
  c.Navigation,
  c.Overlay,
  c.Overlay.Hide,
  c.Overlay.Show,
  c.Overlay.Toggle,
  c.Paragraph,
  c.Popover,
  // @ts-ignore
  c.Popover.Arrow,
  // @ts-ignore
  c.Popover.Hide,
  // @ts-ignore
  c.Popover.Show,
  // @ts-ignore
  c.Popover.Toggle,
  c.Portal,
  c.Sidebar,
  c.Sidebar.Hide,
  c.Sidebar.Show,
  c.Sidebar.Toggle,
  c.Step,
  // @ts-ignore
  c.Step.Hide,
  // @ts-ignore
  c.Step.Next,
  // @ts-ignore
  c.Step.Previous,
  // @ts-ignore
  c.Step.Show,
  // @ts-ignore
  c.Step.Toggle,
  c.Table,
  c.Table.Wrapper,
  c.Tabs,
  // @ts-ignore
  c.Tabs.Next,
  // @ts-ignore
  c.Tabs.Panel,
  // @ts-ignore
  c.Tabs.Previous,
  // @ts-ignore
  c.Tabs.Tab,
  c.Toolbar,
  // @ts-ignore
  c.Toolbar.Content,
  // @ts-ignore
  c.Toolbar.Focusable,
  c.Tooltip,
  // @ts-ignore
  c.Tooltip.Arrow
];

componentsToTest.forEach(Component => {
  test(Component.displayName, () => {
    const theme = {
      palette: {
        primary: ["darkred", "red"],
        primaryText: "white"
      }
    };
    const { container } = render(
      <Component theme={theme} absolute palette="primary" tone={1} opaque />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
