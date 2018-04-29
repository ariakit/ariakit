/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React from "react";
import {
  Flex,
  Group,
  Button,
  Tooltip,
  Input,
  Popover,
  Table,
  Hidden
} from "reas";
import Box from "./Box";

const HomeBannerBox = props => (
  <Hidden.Container initialState={{ visible: true }} context="homeBox">
    {({ hide }) => (
      <Box label="reas" animate onMouseOver={hide} {...props}>
        <Flex column relative>
          <Table width="calc(100% - 40px)" margin="0 20px">
            <Table.Caption>Table</Table.Caption>
            <Table.Body>
              <Table.Row>
                <Table.Cell header>Cell</Table.Cell>
                <Table.Cell>Cell</Table.Cell>
                <Table.Cell>Cell</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell header>Cell</Table.Cell>
                <Table.Cell rowSpan={2}>Cell</Table.Cell>
                <Table.Cell>Cell</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Flex>
        <Flex column relative marginBottom={10}>
          <Group>
            <Button>
              <Tooltip opacity={1}>
                <Tooltip.Arrow />Tooltip
              </Tooltip>Button
            </Button>
            <Input placeholder="Input" autoFocus />
          </Group>
          <Popover visible>
            <Popover.Arrow />Popover
          </Popover>
        </Flex>
      </Box>
    )}
  </Hidden.Container>
);

export default HomeBannerBox;
