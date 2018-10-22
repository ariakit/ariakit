import React from "react";
import { NavLink } from "react-router-dom";
import { styled, Grid, List, Link } from "reakit";
import { palette, ifProp } from "styled-tools";
import s from "styled-selector";
import getSectionUrl from "../utils/getSectionUrl";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import MenuContainer from "../containers/MenuContainer";
import track from "../utils/track";
import Filter from "./Filter";

const Wrapper = styled(Grid)`
  grid-gap: 16px;
  align-content: start;
`;

const MenuList = styled(List)`
  ${s(List)} {
    ${ifProp("contentsVisible", "display: block !important")};
  }

  li {
    margin: 0;
  }
`;

const SectionLink = styled(Link)`
  display: block;
  line-height: 1.75;
  font-weight: 400;
  margin: 0;
  font-size: 18px;
  color: ${palette("backgroundText", -1)};
  border-left: 5px solid transparent;
  padding-left: 20px;
  margin-left: -16px;

  &:hover {
    border-color: ${palette("primary", 2)};
    text-decoration: none;
  }

  &.active {
    font-weight: 600;
    border-color: ${palette("primary", 1)};

    & + ${MenuList} {
      display: block;
    }
  }

  & + ${MenuList} {
    display: none;
  }

  &:not(label) + ${MenuList} & {
    padding-left: 40px;
  }

  label& {
    font-size: 1.1em;
    text-transform: uppercase;
    font-weight: 400;
    opacity: 0.4;

    &:hover,
    &.active {
      border-color: transparent;
    }
  }

  label& + ${MenuList} {
    display: block;
    padding-bottom: 0.75em;
    margin-bottom: 0.75em;
  }
`;

const renderList = (
  rootSections,
  sections = rootSections,
  contentsVisible = sections.length <= 5
) => {
  if (!sections || !sections.length) return null;

  return (
    <MenuList contentsVisible={contentsVisible}>
      {sections.map(section => (
        <li key={section.name}>
          <SectionLink
            use={section.slug ? NavLink : "label"}
            to={getSectionUrl(rootSections, section)}
          >
            {section.name}
          </SectionLink>
          {renderList(rootSections, section.sections)}
        </li>
      ))}
    </MenuList>
  );
};

const Menu = ({ section, showFilter, ...props }) => (
  <Wrapper {...props}>
    <StyleguidistContainer>
      {({ sections }) =>
        showFilter ? (
          <MenuContainer initialState={section} key={section.name}>
            {({ filter, filtered }) => (
              <React.Fragment>
                <Filter
                  onChange={e => filter(e.target.value)}
                  onBlur={track("reakit.filterBlur")}
                />
                {renderList(sections, filtered || section.sections, !!filtered)}
              </React.Fragment>
            )}
          </MenuContainer>
        ) : (
          renderList(sections, section.sections)
        )
      }
    </StyleguidistContainer>
  </Wrapper>
);

export default Menu;
