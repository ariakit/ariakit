import flattenSections from "./flattenSections";

const findSectionByName = (sections, name) =>
  flattenSections(sections).find(section => section.name === name);

export default findSectionByName;
