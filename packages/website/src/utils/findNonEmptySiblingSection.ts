import flattenSections from "./flattenSections";
import getSectionContent from "./getSectionContent";
import sortSections from "./sortSections";
import { Section } from "./types";

const findNonEmptySiblingSection = (
  sections: Section[],
  sectionOrName: Section | string,
  findPrevious: boolean
) => {
  const flattenedSections = findPrevious
    ? flattenSections(sortSections(sections)).reverse()
    : flattenSections(sortSections(sections));
  const name =
    typeof sectionOrName === "string" ? sectionOrName : sectionOrName.name;
  const currentIndex = flattenedSections.findIndex(x => x.name === name);
  if (currentIndex >= 0) {
    return flattenedSections.slice(currentIndex + 1).find(getSectionContent);
  }
  return undefined;
};

export default findNonEmptySiblingSection;
