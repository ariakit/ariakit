import React from "react";
import PropTypes from "prop-types";
import { styled, Grid, List, Link } from "reakit";
import { Link as RouterLink } from "react-router-dom";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import getSectionUrl from "../utils/getSectionUrl";
import findSectionUses from "../utils/findSectionUses";
import SectionContentWrapper from "../elements/SectionContentWrapper";

const Wrapper = styled(Grid.as(SectionContentWrapper))`
  grid-auto-flow: column;
  grid-gap: 5px;
  justify-content: start;
  white-space: nowrap;
`;

const Sections = styled(List)`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 5px;
  & > *:not(:last-child):after {
    content: ", ";
  }
`;

const SectionUses = ({ usedBy, section, ...props }) => {
  const label = usedBy ? "Used by" : "Uses";
  const prop = usedBy ? "usedBy" : "uses";
  return (
    <StyleguidistContainer>
      {({ sections }) => {
        const uses = findSectionUses(sections, section, prop).filter(Boolean);
        if (!uses.length) return null;
        return (
          <Wrapper {...props}>
            {label}
            <Sections>
              {uses.map(s => (
                <li key={s.name}>
                  <Link as={RouterLink} to={getSectionUrl(sections, s)}>
                    {s.name}
                  </Link>
                </li>
              ))}
            </Sections>
          </Wrapper>
        );
      }}
    </StyleguidistContainer>
  );
};

SectionUses.propTypes = {
  section: PropTypes.object.isRequired,
  usedBy: PropTypes.bool
};

export default SectionUses;
