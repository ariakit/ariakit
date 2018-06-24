const flattenSections = sections =>
  sections.filter(Boolean).reduce((acc, section) => {
    if (section.sections && section.sections.length) {
      const childSections = flattenSections(section.sections);
      return [...acc, section, ...childSections];
    }
    return [...acc, section];
  }, []);

export default flattenSections;
