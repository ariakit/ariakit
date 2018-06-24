import flattenSections from "./flattenSections";
import getSectionContent from "./getSectionContent";

const findNonEmptySiblingSection = (sections, sectionOrName, findPrevious) => {
  const flattenedSections = flattenSections(sections);
  const name = sectionOrName.name || sectionOrName;
  const currentIndex = flattenedSections.findIndex(x => x.name === name);

  if (currentIndex >= 0) {
    const finalSections = findPrevious
      ? flattenedSections.reverse()
      : flattenedSections;
    return finalSections.slice(currentIndex).find(x => getSectionContent(x));
  }
  return undefined;
};

export default findNonEmptySiblingSection;
