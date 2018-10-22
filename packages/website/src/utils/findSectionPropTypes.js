/* eslint-disable react/forbid-foreign-prop-types */
import parsePropTypes from "parse-prop-types";
import findSectionUses from "./findSectionUses";

function getStatic(comp, property) {
  if (typeof comp[property] !== "undefined") {
    return comp[property];
  }
  if (
    comp.displayName === undefined &&
    Array.isArray(comp.uses) &&
    comp.uses[0] &&
    comp.uses[0][property]
  ) {
    return comp.uses[0][property];
  }
  return {};
}

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
      propTypes: getStatic(component, "propTypes"),
      defaultProps: { ...getStatic(component, "defaultProps"), ...defaultProps }
    })
  };
};

export default findSectionPropTypes;
