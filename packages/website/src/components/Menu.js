import React from "react";
import { NavLink } from "react-router-dom";
import { styled, Grid, List, Link, Input } from "reakit";
import { prop, ifProp } from "styled-tools";
import MenuContainer from "../containers/MenuContainer";
import track from "../utils/track";

const Wrapper = styled(Grid)`
  grid-gap: 16px;
  align-content: start;
`;

const MenuList = styled(List)`
  ${List} {
    ${ifProp("alwaysVisible", "display: block !important")};
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
  font-size: 1em;
  color: ${prop("theme.black")};
  border-left: 5px solid transparent;
  padding-left: 20px;
  margin-left: -16px;

  &:hover {
    border-color: ${prop("theme.pinkLight")};
    text-decoration: none;
  }

  &.active {
    font-weight: 600;
    border-color: ${prop("theme.pinkDark")};

    & + ${MenuList} {
      display: block;
    }
  }

  & + ${MenuList} {
    display: none;
  }

  & + ${MenuList} & {
    padding-left: 40px;
  }
`;

const renderList = (section, prevSlug = "") => {
  const sections = (section.filtered || section.sections).filter(Boolean);
  if (!sections.length) return null;
  const slug = `${prevSlug}/${section.slug}`;

  const alwaysVisible =
    prevSlug === "" && (sections.length <= 5 || section.filtered);

  return (
    <MenuList alwaysVisible={alwaysVisible}>
      {sections.map(s => (
        <li key={s.slug}>
          <SectionLink as={NavLink} to={`${slug}/${s.slug}`}>
            {s.name}
          </SectionLink>
          {renderList(s, slug)}
        </li>
      ))}
    </MenuList>
  );
};

const Menu = ({ section, showFilter, ...props }) => (
  <Wrapper {...props}>
    {showFilter ? (
      <MenuContainer initialState={section} key={section.name}>
        {({ filter, ...rest }) => (
          <React.Fragment>
            <Input
              placeholder="Filter..."
              onChange={e => filter(e.target.value)}
              onBlur={track("reakit.filterBlur")}
            />
            {renderList(rest)}
          </React.Fragment>
        )}
      </MenuContainer>
    ) : (
      renderList(section)
    )}
  </Wrapper>
);

export default Menu;
