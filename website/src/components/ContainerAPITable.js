import React from "react";
import { Block, Table, Heading, Code, Paragraph } from "reakit";
import isComponentSection from "../utils/isComponentSection";
import SectionContentWrapper from "../elements/SectionContentWrapper";
import TableWrapper from "../elements/TableWrapper";

const renderValue = value => {
  if (typeof value === "function") return null;
  return <Code>{JSON.stringify(value)}</Code>;
};

const ContainerAPITable = ({ section, ...props }) => {
  if (!/Container$/.test(section.name) || !isComponentSection(section)) {
    return null;
  }
  const { default: Container } = section.module;
  return (
    <Block {...props}>
      <SectionContentWrapper column>
        <Heading as="h2">API</Heading>
        <Paragraph>
          Props passed to <Code>children</Code>.
        </Paragraph>
      </SectionContentWrapper>
      <Container>
        {api => (
          <TableWrapper>
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Cell header>Name</Table.Cell>
                  <Table.Cell header>Type</Table.Cell>
                  <Table.Cell header>Initial value</Table.Cell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {Object.entries(api).map(([key, value]) => (
                  <Table.Row key={key}>
                    <Table.Cell>
                      <Code>{key}</Code>
                    </Table.Cell>
                    <Table.Cell>
                      <Code>
                        {Array.isArray(value) ? "array" : typeof value}
                      </Code>
                    </Table.Cell>
                    <Table.Cell>{renderValue(value)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </TableWrapper>
        )}
      </Container>
    </Block>
  );
};

export default ContainerAPITable;
