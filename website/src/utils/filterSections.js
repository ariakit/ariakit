import kebabCase from "../../../src/utils/kebabCase";

const filterSections = (sections = [], input) => {
  const normalizedInput = kebabCase(input)
    .trim()
    .replace(/\s+/, "");
  return sections.reduce((acc, section) => {
    if (section.slug.includes(normalizedInput)) {
      return [...acc, section];
    }
    const childSections = filterSections(section.sections, normalizedInput);
    if (childSections.length) {
      return [...acc, { ...section, sections: childSections }];
    }
    return acc;
  }, []);
};

export default filterSections;
