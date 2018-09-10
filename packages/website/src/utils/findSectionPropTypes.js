/* eslint-disable react/forbid-foreign-prop-types */
import parsePropTypes from "parse-prop-types";
import findSectionUses from "./findSectionUses";

const findSectionPropTypes = (sections, section, defaultProps) => {
  const { default: component } = section.module;
  return {
    ...findSectionUses(sections, section).reduce(
      (acc, usedSection) => ({
        ...acc,
        ...findSectionPropTypes(sections, usedSection, component.defaultProps)
      }),
      {}
    ),
    [section.name]: parsePropTypes({
      propTypes: component.propTypes,
      defaultProps: { ...component.defaultProps, ...defaultProps }
    })
  };
};

export default findSectionPropTypes;
