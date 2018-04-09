import React from "react";
import Box from "./Box";
import {
  Flex,
  Group,
  Button,
  Tooltip,
  Input,
  Popover,
  Table
} from "../../../src";

const LogoBox = () => (
  <Box label="reas" animate top={200} left={200}>
    <Flex key="content2" column relative>
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
    <Flex key="content1" column relative marginBottom={10}>
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
);

export default LogoBox;
