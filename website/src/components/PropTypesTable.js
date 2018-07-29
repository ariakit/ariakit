import React from "react";
import { styled, Table, Block, Heading, Code, Hidden, Button } from "reakit";
import isEmpty from "lodash/isEmpty";
import ArrowDownIcon from "react-icons/lib/md/arrow-drop-down";
import ArrowUpIcon from "react-icons/lib/md/arrow-drop-up";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import Icon from "./Icon";
import TableWrapper from "../elements/TableWrapper";
import findSectionPropTypes from "../utils/findSectionPropTypes";
import isComponentSection from "../utils/isComponentSection";

const StyledHeading = styled(Heading)`
  margin-bottom: 20px;
  @media (max-width: 768px) {
    margin-left: 16px;
    margin-right: 16px;
  }
`;

const StyledCode = styled(Code)`
  white-space: normal;
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
                        <Table>
                          <thead>
                            <tr>
                              <th>Prop</th>
                              <th>Type</th>
                              <th>Required</th>
                              <th>Default</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(types).map(
                              ([name, { type, required, defaultValue }]) => (
                                <tr key={name}>
                                  <td>
                                    <StyledCode>{name}</StyledCode>
                                  </td>
                                  <td>
                                    <StyledCode>{renderType(type)}</StyledCode>
                                  </td>
                                  <td>{required ? "Required" : ""}</td>
                                  <td>
                                    {defaultValue && (
                                      <StyledCode>
                                        {JSON.stringify(defaultValue.value)}
                                      </StyledCode>
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </Table>
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
