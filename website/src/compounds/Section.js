import React from "react";
import { styled, Block } from "reas";

const getSection = ({ location, allSections }) => {
  const slugs = location.pathname.split("/").filter(Boolean);
  return slugs.filter(Boolean).reduce((section, slug) => {
    const items = Array.isArray(section)
      ? section
      : [...section.sections, ...section.components];

    return items.find(item => item.slug === slug);
  }, allSections);
};

const Section = props => {
  const section = getSection(props);
  console.log(section);
  return null;
};

export default Section;
