import findSectionByName from "./findSectionByName";

const findSectionUses = (sections, section, prop = "uses") =>
  section.props && section.props[prop]
    ? section.props[prop].map(name => findSectionByName(sections, name))
    : [];

export default findSectionUses;
