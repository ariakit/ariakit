import flattenSections from "./flattenSections";
import getSectionContent from "./getSectionContent";

const findNonEmptySiblingSection = (sections, sectionOrName, findPrevious) => {
  const flattenedSections = findPrevious
    ? flattenSections(sections).reverse()
    : flattenSections(sections);
  const name = sectionOrName.name || sectionOrName;
  const currentIndex = flattenedSections.findIndex(x => x.name === name);
  if (currentIndex >= 0) {
    return flattenedSections
      .slice(currentIndex + 1)
      .find(x => getSectionContent(x));
  }
  return undefined;
};

export default findNonEmptySiblingSection;
