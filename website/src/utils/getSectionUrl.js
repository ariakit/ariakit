const getSectionUrl = (sections, sectionOrName, prepend = "/") => {
  const name = sectionOrName.name || sectionOrName;
  return sections
    .filter(Boolean)
    .reduce(
      (slugs, section) => {
        if (section.name === name) {
          return [...slugs, section.slug];
        }
        if (section.sections && section.sections.length) {
          const slugsString = slugs.join("");
          const childUrl = getSectionUrl(section.sections, name, slugsString);
          if (childUrl !== slugsString) {
            return [...slugs, section.slug, childUrl];
          }
        }
        return slugs;
      },
      [prepend]
    )
    .filter(Boolean)
    .join("");
};

export default getSectionUrl;
