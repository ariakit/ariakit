import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { styled, Block, List, Link } from "reas";

const mergeChildSections = object => [...object.sections, ...object.components];

const Wrapper = styled(Block)`
  text-align: right;
`;

const SectionLink = styled(Link)`
  display: block;
  text-transform: uppercase;
  color: #333;
  font-size: 0.9em;
  margin: 20px 0 10px;
`;

const MenuList = styled(List)``;

const Menu = ({ sections, ...props }) => (
  <Wrapper {...props}>
    <MenuList>
      <List.Item>
        <SectionLink as={RouterLink} to="/">
          Home
        </SectionLink>
      </List.Item>
      {sections.map(section => (
        <List.Item key={section.slug}>
          <SectionLink as={RouterLink} to={`/${section.slug}`}>
            {section.name}
          </SectionLink>
          <MenuList>
            {mergeChildSections(section).map(child => (
              <List.Item key={child.slug}>
                <Link as={RouterLink} to={`/${section.slug}/${child.slug}`}>
                  {child.name}
                </Link>
              </List.Item>
            ))}
          </MenuList>
        </List.Item>
      ))}
    </MenuList>
  </Wrapper>
);

export default Menu;
