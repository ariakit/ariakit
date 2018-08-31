import React from "react";
import { styled, Block, Flex } from "reakit";
import { Link as RouterLink } from "react-router-dom";
import { theme } from "styled-tools";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import getSectionUrl from "../utils/getSectionUrl";
import findNonEmptySiblingSection from "../utils/findNonEmptySiblingSection";

const Wrapper = styled(Flex)`
  border-top: 1px solid ${theme("grayLightest")};
  margin-top: 2em;
  padding-top: 1em;
  justify-content: space-between;
  @media (max-width: 768px) {
    padding: 0.5em 16px;
    position: sticky;
    bottom: 0px;
    background-color: white;
    z-index: 300;
  }
`;

const NavLink = styled(RouterLink)`
  line-height: 1;
  text-decoration: none;
  color: ${theme("black")};
  &:last-child {
    margin-left: auto;
    text-align: right;
  }
`;

const NavSectionName = styled(Block)`
  font-size: 1.75em;
  font-weight: 600;
  *:hover > & {
    text-decoration: underline;
  }
  @media (max-width: 768px) {
    font-size: 1.35em;
    text-decoration: none !important;
  }
`;

const SectionNavigation = ({ section, ...props }) => (
  <StyleguidistContainer>
    {({ sections }) => {
      const next = findNonEmptySiblingSection(sections, section.name);
      const previous = findNonEmptySiblingSection(sections, section.name, true);
      return (
        <Wrapper {...props}>
          {previous && (
            <NavLink to={getSectionUrl(sections, previous)}>
              Previous article
              <NavSectionName>{previous.name}</NavSectionName>
            </NavLink>
          )}
          {next && (
            <NavLink to={getSectionUrl(sections, next)}>
              Next article
              <NavSectionName>{next.name}</NavSectionName>
            </NavLink>
          )}
        </Wrapper>
      );
    }}
  </StyleguidistContainer>
);

export default SectionNavigation;
