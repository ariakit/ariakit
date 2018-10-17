import React from "react";
import { Block, Table, Heading, Code, Paragraph } from "reakit";
import isComponentSection from "../utils/isComponentSection";
import SectionContentWrapper from "../elements/SectionContentWrapper";

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
        <Heading use="h2">API</Heading>
        <Paragraph>
          Props passed to <Code>children</Code>.
        </Paragraph>
      </SectionContentWrapper>
      <Container>
        {api => (
          <Table.Wrapper>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Initial value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(api).map(([key, value]) => (
                  <tr key={key}>
                    <td>
                      <Code>{key}</Code>
                    </td>
                    <td>
                      <Code>
                        {Array.isArray(value) ? "array" : typeof value}
                      </Code>
                    </td>
                    <td>{renderValue(value)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Table.Wrapper>
        )}
      </Container>
    </Block>
  );
};

export default ContainerAPITable;
