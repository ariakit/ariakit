import parsePropTypes from "parse-prop-types";
import findSectionUses from "./findSectionUses";

const findSectionPropTypes = (sections, section) => ({
  ...findSectionUses(sections, section).reduce(
    (acc, usedSection) => ({
      ...acc,
      ...findSectionPropTypes(sections, usedSection)
    }),
    {}
  ),
  [section.name]: parsePropTypes(section.module.default)
});

export default findSectionPropTypes;
