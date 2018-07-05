import getSections from "./getSections";

const flattenSections = sections =>
  sections.filter(Boolean).reduce((acc, section) => {
    const childSections = getSections(section);
    if (childSections.length) {
      return [...acc, section, ...flattenSections(childSections)];
    }
    return [...acc, section];
  }, []);

export default flattenSections;
