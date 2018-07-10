import React from "react";
import { styled, Table, Block, Heading, Code, Hidden, Button } from "reakit";
import isEmpty from "lodash/isEmpty";
import ArrowDownIcon from "react-icons/lib/md/arrow-drop-down";
import ArrowUpIcon from "react-icons/lib/md/arrow-drop-up";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import Icon from "../elements/Icon";
import findSectionPropTypes from "../utils/findSectionPropTypes";
import isComponentSection from "../utils/isComponentSection";

const StyledHeading = styled(Heading)`
  margin-bottom: 20px;
  @media (max-width: 768px) {
    margin-left: 16px;
    margin-right: 16px;
  }
`;

const TableWrapper = styled(Block)`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const StyledTable = styled(Table)`
  table-layout: auto;
  border: 0;
  td {
    vertical-align: top;
    padding: 0.5em;
  }
  th {
    text-align: left;
    background-color: white;
  }
  tr:nth-child(odd) {
    background-color: #f6f6f6;
  }
`;

const renderType = type => {
  if (!type) return "unknown";
  if (Array.isArray(type)) {
    return type.map(renderType).join(" | ");
  }
  const { name } = type;
  switch (name) {
    case "oneOf":
    case "oneOfType":
      return renderType(type.value);
    case "arrayOf": {
      const rendered = renderType(type.value);
      const final = /|/.test(rendered) ? `(${rendered})` : rendered;
      return `${final}[]`;
    }
    case "objectOf":
      return `{${renderType(type.value)}}`;
    case "instanceOf":
      return type.value;
    case undefined:
      return `"${type}"`;
    default:
      return name;
  }
};

const PropTypesTable = ({ section }) =>
  isComponentSection(section) ? (
    <StyleguidistContainer>
      {({ sections }) => {
        const propTypes = Object.entries(
          findSectionPropTypes(sections, section)
        )
          .filter(([, value]) => !isEmpty(value))
          .reverse();
        return (
          <Block>
            <StyledHeading as="h2">Props</StyledHeading>
            {propTypes.map(([compName, types], i) => (
              <Hidden.Container
                key={`${section.name}${compName}`}
                initialState={{ visible: i === 0 }}
              >
                {({ visible, toggle }) => (
                  <React.Fragment>
                    <Button
                      borderColor="white"
                      backgroundColor="#eee"
                      onClick={toggle}
                      width="100%"
                      borderRadius={0}
                    >
                      {compName}
                      {visible ? (
                        <Icon as={ArrowUpIcon} />
                      ) : (
                        <Icon as={ArrowDownIcon} />
                      )}
                    </Button>
                    {visible && (
                      <TableWrapper>
                        <StyledTable width="100%">
                          <Table.Head>
                            <Table.Row>
                              <Table.Cell header>Prop</Table.Cell>
                              <Table.Cell header>Type</Table.Cell>
                              <Table.Cell header>Required</Table.Cell>
                              <Table.Cell header>Default</Table.Cell>
                            </Table.Row>
                          </Table.Head>
                          <Table.Body>
                            {Object.entries(types).map(
                              ([name, { type, required, defaultValue }]) => (
                                <Table.Row
                                  key={`${section.name}${compName}${name}`}
                                >
                                  <Table.Cell>
                                    <Code>{name}</Code>
                                  </Table.Cell>
                                  <Table.Cell>
                                    <Code>{renderType(type)}</Code>
                                  </Table.Cell>
                                  <Table.Cell>
                                    {required ? "Required" : ""}
                                  </Table.Cell>
                                  <Table.Cell>
                                    {defaultValue && (
                                      <Code>{defaultValue.value}</Code>
                                    )}
                                  </Table.Cell>
                                </Table.Row>
                              )
                            )}
                          </Table.Body>
                        </StyledTable>
                      </TableWrapper>
                    )}
                  </React.Fragment>
                )}
              </Hidden.Container>
            ))}
          </Block>
        );
      }}
    </StyleguidistContainer>
  ) : null;

export default PropTypesTable;
